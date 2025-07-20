const { Appointment, User, Conversation } = require('../models/associations');
const { Op } = require('sequelize');
const NotificationService = require('../services/notificationService');

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - title
 *               - appointmentDate
 *             properties:
 *               receiverId:
 *                 type: integer
 *               conversationId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rendez-vous créé avec succès
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createAppointment = async (req, res) => {
  try {
    const { receiverId, conversationId, title, description, appointmentDate, location, price } = req.body;
    const requesterId = req.user.id;

    if (requesterId === receiverId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas créer un rendez-vous avec vous-même' });
    }

    if (new Date(appointmentDate) <= new Date()) {
      return res.status(400).json({ error: 'La date du rendez-vous doit être dans le futur' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Un tarif valide doit être fourni' });
    }

    const siteCommission = +(price * 0.11).toFixed(2);
    const totalToPay = +(price + siteCommission).toFixed(2);

    const appointment = await Appointment.create({
      requesterId,
      receiverId,
      conversationId,
      title,
      description,
      appointmentDate,
      location,
      price,
      commission: siteCommission,
      totalPrice: totalToPay,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du rendez-vous' });
  }
};



exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Récupération des rendez-vous pour l'utilisateur ID: ${userId}`);

    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [['appointmentDate', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des rendez-vous' });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur a accès à ce rendez-vous
    if (appointment.requesterId !== userId && appointment.receiverId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du rendez-vous' });
  }
};



exports.updateAppointmentStatus = async (req, res) => {
  try {
    console.log('=== updateAppointmentStatus called ===');
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    console.log(`Appointment ID: ${id}, New Status: ${status}, User ID: ${userId}`);

    const appointment = await Appointment.findByPk(id);
    console.log('Appointment found:', appointment ? 'Yes' : 'No');

    if (!appointment) {
      console.log('Appointment not found - returning 404');
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const canUpdate = appointment.receiverId === userId || 
                     (appointment.requesterId === userId && status === 'cancelled');
    
    console.log(`Can update: ${canUpdate}, Receiver ID: ${appointment.receiverId}, Requester ID: ${appointment.requesterId}`);

    if (!canUpdate) {
      console.log('User not authorized - returning 403');
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous' });
    }

    // Si le statut est "accepted", vérifier si le rendez-vous n'est pas déjà accepté
    if (status === 'accepted') {
      console.log('Status is accepted - checking current appointment status');
      
      // Si le rendez-vous est déjà accepté, ne pas re-déclencher le processus de paiement
      if (appointment.status === 'accepted') {
        console.log('Appointment already accepted - returning current state');
        const updatedAppointment = await Appointment.findByPk(id, {
          include: [
            { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
            { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
          ]
        });
        
        return res.json({
          ...updatedAppointment.toJSON(),
          requiresPayment: false,
          message: 'Rendez-vous déjà accepté'
        });
      }
      
      console.log('New acceptance - updating status and preparing payment response');
      // Mettre à jour le statut en premier
      await appointment.update({ status: 'accepted' });
      
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
        ]
      });

      console.log('Appointment with users loaded, returning payment required response');
      
      // Créer une notification pour le demandeur qu'il doit payer
      try {
        const io = req.app.get('socketio');
        if (io) {
          await NotificationService.createAppointmentNotification(
            updatedAppointment.requesterId,
            'payment_required',
            updatedAppointment.receiver.username,
            updatedAppointment.title,
            io
          );
        }
      } catch (notifError) {
        console.error('Erreur création notification paiement:', notifError);
      }

      return res.json({
        ...updatedAppointment.toJSON(),
        requiresPayment: true,
        message: 'Le demandeur va être notifié pour effectuer le paiement'
      });
    }

    console.log(`Updating appointment status to: ${status}`);
    await appointment.update({ status });

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    try {
      let notificationRecipientId;
      let notificationSenderName;
      let notificationType;

      if (status === 'declined') {
        notificationRecipientId = appointment.requesterId;
        notificationSenderName = updatedAppointment.receiver.username;
        notificationType = 'rejected';
      } else if (status === 'cancelled') {
        notificationRecipientId = appointment.receiverId;
        notificationSenderName = updatedAppointment.requester.username;
        notificationType = 'rejected'; // On utilise 'rejected' pour l'annulation
      }      if (notificationRecipientId && notificationSenderName) {
        console.log(`Creating notification for user ${notificationRecipientId}`);
        const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
        await NotificationService.createAppointmentNotification(
          notificationRecipientId,
          notificationType,
          notificationSenderName,
          appointment.title,
          io
        );
      }
    } catch (notifError) {
      console.error('Erreur création notification statut rendez-vous:', notifError);
    }

    console.log('Sending final response with updated appointment');
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erreur mise à jour rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du rendez-vous' });
  }
};



exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    if (appointment.requesterId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce rendez-vous' });
    }

    await appointment.destroy();
    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du rendez-vous' });
  }
};



exports.getAppointmentsByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }

    const appointments = await Appointment.findAll({
      where: {
        conversationId: conversationId,
        [Op.or]: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [['appointmentDate', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Erreur récupération rendez-vous conversation:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des rendez-vous' });
  }
};

/**
 * @swagger
 * /api/appointments/{id}/create-payment-session:
 *   post:
 *     summary: Créer une session de paiement Stripe pour un rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Session de paiement créée avec succès
 */

exports.renderPaymentResult = async (req, res) => {
  const { status, appointment_id, session_id } = req.query;

  try {
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).send(`
        <html>
          <body style="text-align:center;margin-top:50px;">
            <h1>❌ Rendez-vous introuvable</h1>
            <p>Vous serez redirigé vers l’accueil dans quelques secondes...</p>
            <script>setTimeout(() => window.location.href = '/', 5000);</script>
          </body>
        </html>
      `);
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const frontendUrl = `${protocol}://${host}/`;

    if (status === 'success') {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid') {
        await appointment.update({
          status: 'accepted',
          paymentStatus: 'paid'
        });
      }

      return res.send(`
        <html>
          <body style="text-align:center;margin-top:50px;font-family:sans-serif;">
            <h1>✅ Paiement réussi !</h1>
            <p>Votre rendez-vous a été confirmé.</p>
            <p>Vous allez être redirigé vers l'accueil dans quelques secondes...</p>
            <script>setTimeout(() => window.location.href = '${frontendUrl}', 5000);</script>
          </body>
        </html>
      `);
    }

    if (status === 'cancel') {
      await appointment.update({ paymentStatus: 'failed', status: 'cancelled' });
      return res.send(`
        <html>
          <body style="text-align:center;margin-top:50px;font-family:sans-serif;">
            <h1>❌ Paiement annulé</h1>
            <p>Votre rendez-vous a été annulé ou n'a pas pu être payé.</p>
            <p>Vous allez être redirigé vers l'accueil dans quelques secondes...</p>
            <script>setTimeout(() => window.location.href = '${frontendUrl}', 5000);</script>
          </body>
        </html>
      `);
    }

    res.status(400).send(`
      <html>
        <body style="text-align:center;margin-top:50px;">
          <h1>⚠️ Paramètres invalides</h1>
          <p>Vous serez redirigé vers l’accueil dans quelques secondes...</p>
          <script>setTimeout(() => window.location.href = '/', 5000);</script>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Erreur payment-result:', err);
    res.status(500).send(`
      <html>
        <body style="text-align:center;margin-top:50px;">
          <h1>💥 Erreur serveur</h1>
          <p>Vous serez redirigé vers l’accueil dans quelques secondes...</p>
          <script>setTimeout(() => window.location.href = '/', 5000);</script>
        </body>
      </html>
    `);
  }
};

exports.createPaymentSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Seul le receveur du RDV peut payer (commission plateforme)
    if (appointment.receiverId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à payer ce rendez-vous' });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Ce rendez-vous a déjà été payé' });
    }
    const protocol = req.protocol; // 'http' ou 'https'
const host = req.get('host');  // exemple: 'localhost:5000' ou 'ap
const baseUrl = `${protocol}://${host}`;
    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Rendez-vous: ${appointment.title}`,
              description: `Avec ${appointment.receiver.username} - ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}`,
            },
            unit_amount: Math.round(appointment.totalPrice * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
success_url: `${baseUrl}/api/appointments/payment-result?status=success&appointment_id=${id}&session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${baseUrl}/api/appointments/payment-result?status=cancel&appointment_id=${id}&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        appointmentId: id.toString(),
        requesterId: userId.toString(),
        receiverId: appointment.receiverId.toString()
      },
      customer_email: appointment.requester.email
    });

    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session paiement:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la session de paiement' });
  }
};

/**
 * @swagger
 * /api/appointments/payment-webhook:
 *   post:
 *     summary: Webhook Stripe pour confirmer les paiements
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Webhook traité avec succès
 */
exports.handlePaymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const io = req.app.get('socketio');
      await handleSuccessfulPayment(session, io);
      break;
    default:
      console.log(`Type d'événement non géré: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Gérer un paiement réussi
 */
async function handleSuccessfulPayment(session, io) {
  try {
    const appointmentId = session.metadata.appointmentId;
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ]
    });

    if (!appointment) {
      console.error('Rendez-vous non trouvé pour le paiement:', appointmentId);
      return;
    }

    // Mettre à jour le statut du rendez-vous et du paiement
    await appointment.update({
      status: 'accepted',
      paymentStatus: 'paid'
    });

    // Créer une notification pour le demandeur (paiement confirmé)
    if (io) {
      await NotificationService.createAppointmentNotification(
        appointment.requesterId,
        'payment_confirmed',
        'Système',
        appointment.title,
        io
      );

      // Créer une notification pour le receveur (RDV accepté et payé)
      await NotificationService.createAppointmentNotification(
        appointment.receiverId,
        'accepted',
        appointment.requester.username,
        appointment.title,
        io
      );
    }

    console.log(`Paiement confirmé pour le rendez-vous ${appointmentId}`);
  } catch (error) {
    console.error('Erreur traitement paiement réussi:', error);
  }
}

/**
 * @swagger
 * /api/appointments/payment-success:
 *   get:
 *     summary: Vérifier le statut d'un paiement
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la session Stripe
 *       - in: query
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Statut du paiement vérifié
 */
exports.verifyPaymentSuccess = async (req, res) => {
  try {
    const { session_id, appointment_id } = req.query;
    const userId = req.user.id;

    // Vérifier la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Le paiement n\'a pas été confirmé' });
    }

    // Vérifier le rendez-vous
    const appointment = await Appointment.findByPk(appointment_id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    if (appointment.requesterId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({
      success: true,
      appointment: appointment,
      paymentStatus: session.payment_status
    });
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la vérification du paiement' });
  }
};


