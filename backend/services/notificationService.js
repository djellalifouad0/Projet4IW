const { createNotification, NOTIFICATION_TYPES } = require('../controllers/notificationController');
const Notification = require('../models/notification');
const User = require('../models/user');
const { Op } = require('sequelize');

class NotificationService {
    /**
   * Vérifier si l'utilisateur a activé un type de notification
   */
  static async isNotificationEnabled(userId, notificationType) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.notificationSettings) return true; // Par défaut activé
      
      const settings = JSON.parse(user.notificationSettings);
      
      // Mapping des types de notifications
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

    /**
   * Créer une notification de bienvenue
   */
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
  /**
   * Créer une notification pour un nouveau commentaire
   */
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
  }  /**
   * Créer une notification pour un nouveau like
   */
  static async createNewLikeNotification(userId, likerName, skillTitle, likerId = null, io = null) {
    if (!(await this.isNotificationEnabled(userId, NOTIFICATION_TYPES.NEW_LIKE))) {
      return null;
    }
    
    // Supprimer toutes les anciennes notifications de like de ce même utilisateur pour cette compétence
    if (likerId) {
      // D'abord, récupérer toutes les notifications de like pour cet utilisateur
      const existingNotifications = await Notification.findAll({
        where: {
          userId: userId,
          type: NOTIFICATION_TYPES.NEW_LIKE
        }
      });

      // Filtrer et supprimer celles qui correspondent au même likeur et à la même compétence
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

      // Supprimer les notifications correspondantes
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
  }  /**
   * Créer une notification pour un nouveau rendez-vous
   */
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

  /**
   * Créer une notification pour un nouveau message
   */
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

  /**
   * Créer une notification pour mise à jour de profil
   */
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
