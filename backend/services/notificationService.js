const { createNotification, NOTIFICATION_TYPES } = require('../controllers/notificationController');
const Notification = require('../models/notification');

class NotificationService {
    /**
   * Créer une notification de bienvenue
   */
  static async createWelcomeNotification(userId, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.WELCOME,
      "Bienvenue sur SkillSwap ! Commencez à explorer les compétences de la communauté."
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }
  /**
   * Créer une notification pour un nouveau commentaire
   */
  static async createNewCommentNotification(userId, commenterName, skillTitle, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.NEW_COMMENT,
      `${commenterName} a commenté votre compétence "${skillTitle}".`,
      { skillTitle, commenterName }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }
  /**
   * Créer une notification pour un nouveau like
   */
  static async createNewLikeNotification(userId, likerName, skillTitle, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.NEW_LIKE,
      `${likerName} a aimé votre compétence "${skillTitle}".`,
      { skillTitle, likerName }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }  /**
   * Créer une notification pour un nouveau rendez-vous
   */
  static async createAppointmentNotification(userId, type, otherUserName, appointmentTitle, io = null) {
    let message = '';
    
    switch (type) {
      case 'created':
        message = `${otherUserName} a demandé un rendez-vous pour "${appointmentTitle}".`;
        break;
      case 'accepted':
        message = `${otherUserName} a accepté votre demande de rendez-vous pour "${appointmentTitle}".`;
        break;
      case 'rejected':
        message = `${otherUserName} a refusé votre demande de rendez-vous pour "${appointmentTitle}".`;
        break;
    }

    const notification = await createNotification(
      userId,
      type === 'created' ? NOTIFICATION_TYPES.APPOINTMENT_CREATED :
      type === 'accepted' ? NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED :
      NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
      message,
      { appointmentTitle, otherUserName }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }
  /**
   * Créer une notification pour une nouvelle évaluation
   */
  static async createNewRatingNotification(userId, raterName, skillTitle, rating, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.NEW_RATING,
      `${raterName} a évalué votre compétence "${skillTitle}" avec ${rating}/5 étoiles.`,
      { skillTitle, raterName, rating }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }

  /**
   * Créer une notification pour un nouveau message
   */
  static async createNewMessageNotification(userId, senderName, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.NEW_MESSAGE,
      `Vous avez reçu un nouveau message de ${senderName}.`,
      { senderName }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }

  /**
   * Créer une notification pour mise à jour de profil
   */
  static async createProfileUpdateNotification(userId, io = null) {
    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.PROFILE_UPDATE,
      "Votre profil a été mis à jour avec succès."
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }
  /**
   * Obtenir le nombre de notifications non lues pour un utilisateur
   */
  static async getUnreadNotificationCount(userId) {
    try {
      const count = await Notification.count({
        where: {
          userId: userId,
          read: false
        }
      });
      return count;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      return 0;
    }
  }

  /**
   * Notifier en temps réel un utilisateur via WebSocket (si connecté)
   */
  static async notifyUserRealTime(userId, notificationData, io) {
    if (!io) return;
    
    try {
      // Obtenir le socket de l'utilisateur s'il est connecté
      const sockets = await io.fetchSockets();
      const userSocket = sockets.find(socket => socket.userId === userId);
      
      if (userSocket) {
        // Envoyer la nouvelle notification
        userSocket.emit('new-notification', notificationData);
        
        // Mettre à jour le compteur de notifications non lues
        const unreadCount = await this.getUnreadNotificationCount(userId);
        userSocket.emit('notification-count-update', unreadCount);
        
        console.log(`🔔 Notification en temps réel envoyée à l'utilisateur ${userId}`);
      } else {
        console.log(`📵 Utilisateur ${userId} non connecté - notification stockée uniquement`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification en temps réel:', error);
    }
  }
}

module.exports = NotificationService;
