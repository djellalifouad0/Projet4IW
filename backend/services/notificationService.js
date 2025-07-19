const { createNotification, NOTIFICATION_TYPES } = require('../controllers/notificationController');
const Notification = require('../models/notification');
const User = require('../models/user');
const { Op } = require('sequelize');

class NotificationService {
    
  static async isNotificationEnabled(userId, notificationType) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.notificationSettings) return true; // Par défaut activé
      
      const settings = JSON.parse(user.notificationSettings);

      const typeMapping = {
        [NOTIFICATION_TYPES.NEW_MESSAGE]: 'messages',
        [NOTIFICATION_TYPES.NEW_LIKE]: 'likes', 
        [NOTIFICATION_TYPES.NEW_COMMENT]: 'comments',
        [NOTIFICATION_TYPES.APPOINTMENT_CREATED]: 'appointments',
        [NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED]: 'appointments',
        [NOTIFICATION_TYPES.APPOINTMENT_REJECTED]: 'appointments',
        [NOTIFICATION_TYPES.NEW_RATING]: 'ratings',
        [NOTIFICATION_TYPES.PROFILE_UPDATE]: 'profileUpdates',
        [NOTIFICATION_TYPES.WELCOME]: 'updates'
      };
      
      const settingKey = typeMapping[notificationType];
      return settingKey ? settings[settingKey] !== false : true;
    } catch (error) {
      console.error('Erreur vérification paramètres notifications:', error);
      return true; // En cas d'erreur, on active par défaut
    }
  }

    
  static async createWelcomeNotification(userId, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.WELCOME))) {
      return null;
    }
    
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
  
  static async createNewCommentNotification(userId, commenterName, skillTitle, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.NEW_COMMENT))) {
      return null;
    }
    
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
  static async createNewLikeNotification(userId, likerName, skillTitle, likerId = null, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.NEW_LIKE))) {
      return null;
    }

    if (likerId) {

      const existingNotifications = await Notification.findAll({
        where: {
          userId: userId,
          type: NOTIFICATION_TYPES.NEW_LIKE
        }
      });

      const notificationsToDelete = [];
      for (const notification of existingNotifications) {
        if (notification.data) {
          let notificationData;
          try {
            notificationData = typeof notification.data === 'string' 
              ? JSON.parse(notification.data) 
              : notification.data;
          } catch (e) {
            continue; // Ignorer les données mal formées
          }
          
          if (notificationData.likerName === likerName && notificationData.skillTitle === skillTitle) {
            notificationsToDelete.push(notification.id);
          }
        }
      }

      if (notificationsToDelete.length > 0) {
        await Notification.destroy({
          where: {
            id: {
              [Op.in]: notificationsToDelete
            }
          }
        });
      }
    }

    const notification = await createNotification(
      userId,
      NOTIFICATION_TYPES.NEW_LIKE,
      `${likerName} a aimé votre compétence "${skillTitle}".`,
      { skillTitle, likerName, likerId }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }

    return notification;
  }  
  static async createAppointmentNotification(userId, type, otherUserName, appointmentTitle, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.APPOINTMENT_CREATED))) {
      return null;
    }
    
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
      case 'payment_confirmed':
        message = `Votre paiement pour le rendez-vous "${appointmentTitle}" a été confirmé.`;
        break;
    }

    const notification = await createNotification(
      userId,
      type === 'created' ? NOTIFICATION_TYPES.APPOINTMENT_CREATED :
      type === 'accepted' ? NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED :
      type === 'payment_confirmed' ? NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED :
      NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
      message,
      { appointmentTitle, otherUserName }
    );
    
    if (notification && io) {
      await this.notifyUserRealTime(userId, notification, io);
    }
    
    return notification;
  }
  
  static async createNewRatingNotification(userId, raterName, skillTitle, rating, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.NEW_RATING))) {
      return null;
    }
    
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

  
  static async createNewMessageNotification(userId, senderName, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.NEW_MESSAGE))) {
      return null;
    }
    
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

  
  static async createProfileUpdateNotification(userId, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.PROFILE_UPDATE))) {
      return null;
    }
    
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

  
  static async notifyUserRealTime(userId, notificationData, io) {
    if (!io) return;
    
    try {

      const sockets = await io.fetchSockets();
      const userSocket = sockets.find(socket => socket.userId === userId);
      
      if (userSocket) {

        userSocket.emit('new-notification', notificationData);

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

