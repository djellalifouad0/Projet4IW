const Notification = require('../models/notification');
const User = require('../models/user');
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
    const enrichedNotifications = await enrichNotificationsWithUserData(notifications);
    const groupedNotifications = groupNotificationsByDate(enrichedNotifications);
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


async function enrichNotificationsWithUserData(notifications) {
  const enrichedNotifications = [];
  
  for (const notification of notifications) {
    const enrichedNotification = notification.toJSON();

    if (notification.data) {
      let notificationData;
      try {
        notificationData = typeof notification.data === 'string' 
          ? JSON.parse(notification.data) 
          : notification.data;
      } catch (e) {
        notificationData = {};
      }

      if (notificationData.commenterName || notificationData.likerName || notificationData.raterName || notificationData.otherUserName || notificationData.senderName) {
        const username = notificationData.commenterName || 
                        notificationData.likerName || 
                        notificationData.raterName || 
                        notificationData.otherUserName || 
                        notificationData.senderName;
        
        try {
          const user = await User.findOne({ 
            where: { username },
            attributes: ['id', 'username', 'avatar', 'profileToken']
          });
          
          if (user) {
            enrichedNotification.triggerUser = {
              id: user.id,
              username: user.username,
              avatar: user.avatar,
              profileToken: user.profileToken
            };
          }
        } catch (error) {
          console.log('Erreur lors de la récupération de l\'utilisateur:', error);
        }
      }
    }
    
    enrichedNotifications.push(enrichedNotification);
  }
  
  return enrichedNotifications;
}


function groupNotificationsByDate(notifications) {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey;

    if (date.toDateString() === today.toDateString()) {
      dateKey = "Aujourd'hui";
    }

    else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Hier";
    }

    else if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      dateKey = days[date.getDay()];
    }

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


exports.getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const defaultSettings = {
      messages: true,
      likes: true,
      comments: true,
      appointments: true,
      ratings: true,
      updates: true,
      profileUpdates: true
    };

    const settings = user.notificationSettings ? JSON.parse(user.notificationSettings) : defaultSettings;

    res.json(settings);
  } catch (error) {
    console.error('Erreur récupération paramètres notifications:', error);
    res.status(500).json({ error: 'Erreur récupération paramètres notifications' });
  }
};


exports.updateNotificationSettings = async (req, res) => {
  try {
    const { messages, likes, comments, appointments, ratings, updates, profileUpdates } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const settings = {
      messages: messages !== undefined ? messages : true,
      likes: likes !== undefined ? likes : true,
      comments: comments !== undefined ? comments : true,
      appointments: appointments !== undefined ? appointments : true,
      ratings: ratings !== undefined ? ratings : true,
      updates: updates !== undefined ? updates : true,
      profileUpdates: profileUpdates !== undefined ? profileUpdates : true
    };

    user.notificationSettings = JSON.stringify(settings);
    await user.save();

    res.json({ 
      message: 'Paramètres de notifications mis à jour',
      settings 
    });
  } catch (error) {
    console.error('Erreur mise à jour paramètres notifications:', error);
    res.status(500).json({ error: 'Erreur mise à jour paramètres notifications' });
  }
};

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

