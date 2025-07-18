const { Appointment, User, Conversation } = require('../models/associations');
const { Op } = require('sequelize');
const NotificationService = require('../services/notificationService');


exports.createAppointment = async (req, res) => {
  try {
    const { receiverId, conversationId, title, description, appointmentDate, location } = req.body;
    const requesterId = req.user.id;

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


exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const canUpdate = appointment.receiverId === userId || 
                     (appointment.requesterId === userId && status === 'cancelled');    if (!canUpdate) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous' });
    }

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

      if (status === 'accepted' || status === 'declined') {

        notificationRecipientId = appointment.requesterId;
        notificationSenderName = updatedAppointment.receiver.username;
        notificationType = status === 'accepted' ? 'accepted' : 'rejected';
      } else if (status === 'cancelled') {

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

