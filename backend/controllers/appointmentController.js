const { Appointment, User, Conversation } = require('../models/associations');
const { Op } = require('sequelize');

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
    }

    // Vérifier que la date est dans le futur
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
    });

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
                     (appointment.requesterId === userId && status === 'cancelled');

    if (!canUpdate) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous' });
    }

    await appointment.update({ status });

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ]
    });

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
