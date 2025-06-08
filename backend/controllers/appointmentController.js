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
exports.createAppointment = async (req, res) => {
  try {
    const { receiverId, conversationId, title, description, appointmentDate, location } = req.body;
    const requesterId = req.user.id;

    // Vérifier que l'utilisateur ne peut pas créer un rendez-vous avec lui-même
    if (requesterId === receiverId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas créer un rendez-vous avec vous-même' });
    }    // Vérifier que la date est dans le futur
    if (new Date(appointmentDate) <= new Date()) {
      return res.status(400).json({ error: 'La date du rendez-vous doit être dans le futur' });
    }

    const appointment = await Appointment.create({
      requesterId,
      receiverId,
      conversationId,
      title,
      description,
      appointmentDate,
      location,
      status: 'pending'
    });

    // Récupérer l'appointment avec les relations
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ]
    });    // Créer une notification pour le destinataire
    try {
      const requesterName = createdAppointment.requester.username;
      const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
      await NotificationService.createAppointmentNotification(
        receiverId,
        'created',
        requesterName,
        title,
        io
      );
    } catch (notifError) {
      console.error('Erreur création notification rendez-vous:', notifError);
    }

    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du rendez-vous' });
  }
};

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Récupérer tous les rendez-vous de l'utilisateur
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

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

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, declined, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur peut modifier ce rendez-vous
    const canUpdate = appointment.receiverId === userId || 
                     (appointment.requesterId === userId && status === 'cancelled');    if (!canUpdate) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous' });
    }

    // Logique spéciale pour l'annulation et la suppression automatique
    if (status === 'cancelled') {
      // Si le rendez-vous n'a jamais été accepté (encore en pending), on le supprime complètement
      if (appointment.status === 'pending') {
        await appointment.destroy();
        return res.json({ message: 'Rendez-vous supprimé (pas encore accepté)', deleted: true });
      }
      // Si le rendez-vous avait été accepté, on garde le log avec le statut cancelled
      await appointment.update({ status });
    } else if (status === 'declined') {
      // Si quelqu'un refuse un rendez-vous en pending, on le supprime complètement
      if (appointment.status === 'pending') {
        await appointment.destroy();
        return res.json({ message: 'Rendez-vous supprimé (refusé)', deleted: true });
      }
      // Si c'était déjà accepté et qu'on le refuse maintenant, on garde le log
      await appointment.update({ status });
    } else {
      // Pour les autres statuts (accepted), on fait une mise à jour normale
      await appointment.update({ status });    }

    // Si l'appointment a été supprimé, pas besoin de récupérer les données
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    // Si l'appointment n'existe plus (supprimé), on retourne juste un message de succès
    if (!updatedAppointment) {
      return res.json({ message: 'Rendez-vous traité avec succès', deleted: true });
    }

    // Créer une notification pour informer du changement de statut
    try {
      let notificationRecipientId;
      let notificationSenderName;
      let notificationType;

      if (status === 'accepted' || status === 'declined') {
        // Le receveur a accepté/refusé, notifier le demandeur
        notificationRecipientId = appointment.requesterId;
        notificationSenderName = updatedAppointment.receiver.username;
        notificationType = status === 'accepted' ? 'accepted' : 'rejected';
      } else if (status === 'cancelled') {
        // Le demandeur a annulé, notifier le receveur
        notificationRecipientId = appointment.receiverId;
        notificationSenderName = updatedAppointment.requester.username;
        notificationType = 'rejected'; // On utilise 'rejected' pour l'annulation
      }      if (notificationRecipientId && notificationSenderName) {
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

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erreur mise à jour rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du rendez-vous' });
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rendez-vous supprimé
 */
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Seul le créateur peut supprimer le rendez-vous
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

/**
 * @swagger
 * /api/appointments/conversation/{conversationId}:
 *   get:
 *     summary: Récupérer les rendez-vous d'une conversation
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des rendez-vous de la conversation
 */
exports.getAppointmentsByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de cette conversation
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
