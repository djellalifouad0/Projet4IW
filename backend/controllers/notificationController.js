const Notification = require('../models/notification');
const User = require('../models/user');

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupère les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Grouper les notifications par date
    const groupedNotifications = groupNotificationsByDate(notifications);

    res.json({
      notifications: groupedNotifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur récupération notifications' });
  }
};

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Notification mise à jour
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ error: 'Notification introuvable' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur mise à jour notification' });
  }
};

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Marque toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    res.status(500).json({ error: 'Erreur marquage notifications' });
  }
};

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Récupère le nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({ 
      where: { userId: req.user.id, read: false } 
    });
    res.json({ count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ error: 'Erreur comptage notifications' });
  }
};

/**
 * Fonction utilitaire pour créer une notification
 */
exports.createNotification = async (userId, type, message, data = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      data: data ? JSON.stringify(data) : null,
      read: false
    });
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    throw error;
  }
};

/**
 * Fonction pour grouper les notifications par date
 */
function groupNotificationsByDate(notifications) {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey;
    
    // Aujourd'hui
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Aujourd'hui";
    }
    // Hier
    else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Hier";
    }
    // Cette semaine (7 derniers jours)
    else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      dateKey = days[date.getDay()];
    }
    // Plus ancien
    else {
      dateKey = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(notification);
  });
  
  return groups;
}

/**
 * Types de notifications prédéfinis
 */
exports.NOTIFICATION_TYPES = {
  WELCOME: 'welcome',
  PROFILE_UPDATE: 'profile_update',
  NEW_COMMENT: 'new_comment',
  NEW_LIKE: 'new_like',
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_ACCEPTED: 'appointment_accepted',
  APPOINTMENT_REJECTED: 'appointment_rejected',
  NEW_RATING: 'new_rating',
  NEW_MESSAGE: 'new_message'
};
