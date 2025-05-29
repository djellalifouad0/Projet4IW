const { User, Conversation, Message, Skill, Rating, Appointment, Notification } = require('../models/associations');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Interface d'administration pour gérer l'application
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Récupère les statistiques générales du dashboard admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Statistiques générales
    const [totalUsers, totalSkills, totalConversations, totalMessages, totalAppointments] = await Promise.all([
      User.count(),
      Skill.count(),
      Conversation.count(),
      Message.count(),
      Appointment.count()
    ]);

    // Utilisateurs actifs vs inactifs
    const [activeUsers, inactiveUsers] = await Promise.all([
      User.count({ where: { isActive: true } }),
      User.count({ where: { isActive: false } })
    ]);

    // Nouveaux utilisateurs cette semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.count({
      where: {
        createdAt: { [Op.gte]: weekAgo }
      }
    });

    // Messages cette semaine
    const messagesThisWeek = await Message.count({
      where: {
        createdAt: { [Op.gte]: weekAgo }
      }
    });

    // Rendez-vous en attente
    const pendingAppointments = await Appointment.count({
      where: { status: 'pending' }
    });

    // Statistiques par jour (7 derniers jours)
    const dailyStats = await Promise.all([
      // Nouveaux utilisateurs par jour
      User.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          createdAt: { [Op.gte]: weekAgo }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
      }),
      // Messages par jour
      Message.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          createdAt: { [Op.gte]: weekAgo }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
      })
    ]);

    res.json({
      overview: {
        totalUsers,
        totalSkills,
        totalConversations,
        totalMessages,
        totalAppointments,
        activeUsers,
        inactiveUsers,
        newUsersThisWeek,
        messagesThisWeek,
        pendingAppointments
      },
      charts: {
        newUsers: dailyStats[0],
        messages: dailyStats[1]
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Erreur récupération statistiques' });
  }
};

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Récupère tous les utilisateurs avec pagination et filtres
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom d'utilisateur ou email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status !== 'all') {
      whereConditions.isActive = status === 'active';
    }

    const users = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],      include: [
        {
          model: Skill,
          as: 'skills',
          attributes: ['id', 'description']
        }
      ]
    });

    // Enrichir avec des statistiques pour chaque utilisateur
    const enrichedUsers = await Promise.all(
      users.rows.map(async (user) => {
        const [messagesCount, skillsCount, ratingsStats] = await Promise.all([
          Message.count({ where: { senderId: user.id } }),
          Skill.count({ where: { userId: user.id } }),
          Rating.findOne({
            where: { ratedUserId: user.id },
            attributes: [
              [Sequelize.fn('AVG', Sequelize.col('rating')), 'average'],
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
            ]
          })
        ]);

        return {
          ...user.toJSON(),
          stats: {
            messagesCount,
            skillsCount,
            averageRating: parseFloat(ratingsStats?.dataValues?.average) || 0,
            totalRatings: parseInt(ratingsStats?.dataValues?.total) || 0
          }
        };
      })
    );

    res.json({
      users: enrichedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
        totalItems: users.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Récupère les détails d'un utilisateur
 *     tags: [Admin]
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
 *         description: Détails de l'utilisateur
 */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Récupérer des statistiques détaillées
    const [conversations, sentMessages, receivedMessages, appointments, ratings] = await Promise.all([
      Conversation.findAll({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
        },
        include: [
          { model: User, as: 'user1', attributes: ['id', 'username'] },
          { model: User, as: 'user2', attributes: ['id', 'username'] }
        ]
      }),
      Message.count({ where: { senderId: userId } }),
      Message.count({
        include: [
          {
            model: Conversation,
            where: {
              [Op.or]: [{ user1Id: userId }, { user2Id: userId }]
            }
          }
        ],
        where: { senderId: { [Op.ne]: userId } }
      }),
      Appointment.findAll({
        where: {
          [Op.or]: [{ requesterId: userId }, { receiverId: userId }]
        },
        include: [
          { model: User, as: 'requester', attributes: ['id', 'username'] },
          { model: User, as: 'receiver', attributes: ['id', 'username'] }
        ]
      }),
      Rating.findAll({
        where: { ratedUserId: userId },
        include: [
          { model: User, as: 'rater', attributes: ['id', 'username'] }
        ]
      })
    ]);

    res.json({
      user: user.toJSON(),
      stats: {
        conversationsCount: conversations.length,
        sentMessages,
        receivedMessages,
        appointmentsCount: appointments.length,
        ratingsCount: ratings.length
      },
      details: {
        conversations,
        appointments,
        ratings
      }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ error: 'Erreur récupération détails utilisateur' });
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *       404:
 *         description: Utilisateur introuvable
 *       400:
 *         description: Données invalides
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, isActive, role } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }    // Préparer les données à mettre à jour
    const updateData = {};
    
    if (username !== undefined && username !== user.username) {
      // Vérifier que le nom d'utilisateur n'est pas déjà pris
      const existingUser = await User.findOne({ 
        where: { 
          username, 
          id: { [Op.ne]: userId } 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
      }
      updateData.username = username;
    }

    if (email !== undefined && email !== user.email) {
      // Vérifier que l'email n'est pas déjà pris
      const existingUser = await User.findOne({ 
        where: { 
          email, 
          id: { [Op.ne]: userId } 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      updateData.email = email;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (role !== undefined) {
      // Vérifier que le rôle est valide
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
      }
      updateData.role = role;
    }

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills',
          attributes: ['id', 'description']
        }
      ]
    });

    res.json({
      message: 'Utilisateur modifié avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
  }
};

/**
 * @swagger
 * /admin/conversations:
 *   get:
 *     summary: Récupère toutes les conversations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
exports.getAllConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await Conversation.findAndCountAll({
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'username', 'avatar'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastMessageAt', 'DESC']]
    });

    // Enrichir avec le nombre de messages pour chaque conversation
    const enrichedConversations = await Promise.all(
      conversations.rows.map(async (conv) => {
        const messagesCount = await Message.count({
          where: { conversationId: conv.id }
        });

        const lastMessage = await Message.findOne({
          where: { conversationId: conv.id },
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['username'] }]
        });

        return {
          ...conv.toJSON(),
          messagesCount,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderName: lastMessage.sender.username
          } : null
        };
      })
    );

    res.json({
      conversations: enrichedConversations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(conversations.count / limit),
        totalItems: conversations.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Erreur récupération conversations' });
  }
};

/**
 * @swagger
 * /admin/skills:
 *   get:
 *     summary: Récupère toutes les compétences
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des compétences
 */
exports.getAllSkills = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;    const whereConditions = {};
    if (search) {
      whereConditions[Op.or] = [
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const skills = await Skill.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      skills: skills.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(skills.count / limit),
        totalItems: skills.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting skills:', error);
    res.status(500).json({ error: 'Erreur récupération compétences' });
  }
};

/**
 * @swagger
 * /admin/skills/{id}:
 *   delete:
 *     summary: Supprime une compétence
 *     tags: [Admin]
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
 *         description: Compétence supprimée
 */
exports.deleteSkill = async (req, res) => {
  try {
    const skillId = req.params.id;
    
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Compétence introuvable' });
    }

    // Importer les modèles requis pour la suppression
    const Like = require('../models/like');
    const Comment = require('../models/comment');
    
    // Commencer une transaction pour assurer la cohérence
    const transaction = await sequelize.transaction();
    
    try {
      // Supprimer tous les likes associés à cette compétence
      await Like.destroy({
        where: { skillId: skillId },
        transaction
      });
      
      // Supprimer tous les commentaires associés à cette compétence
      await Comment.destroy({
        where: { skillId: skillId },
        transaction
      });
      
      // Maintenant supprimer la compétence
      await skill.destroy({ transaction });
      
      // Confirmer la transaction
      await transaction.commit();
      
      res.json({ message: 'Compétence supprimée avec succès' });
    } catch (transactionError) {
      // Annuler la transaction en cas d'erreur
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('Error deleting skill:', error);
    
    // Gestion spécifique des erreurs de contraintes
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette compétence car elle est référencée par d\'autres données.' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression de la compétence' });
  }
};

/**
 * @swagger
 * /admin/appointments:
 *   get:
 *     summary: Récupère tous les rendez-vous
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
exports.getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    const whereConditions = {};
    if (status !== 'all') {
      whereConditions.status = status;
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC']]
    });

    res.json({
      appointments: appointments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(appointments.count / limit),
        totalItems: appointments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ error: 'Erreur récupération rendez-vous' });
  }
};

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     summary: Bannir/débannir un utilisateur
 *     tags: [Admin]
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
 *         description: Statut utilisateur modifié
 */
exports.toggleUserBan = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `Utilisateur ${user.isActive ? 'débanni' : 'banni'} avec succès`,
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user ban:', error);
    res.status(500).json({ error: 'Erreur changement statut utilisateur' });
  }
};

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Supprime définitivement un utilisateur
 *     tags: [Admin]
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
 *         description: Utilisateur supprimé
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Empêcher la suppression des administrateurs
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un administrateur' });
    }

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé définitivement' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur suppression utilisateur' });
  }
};

/**
 * @swagger
 * /admin/messages/flagged:
 *   get:
 *     summary: Récupère les messages signalés
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages signalés
 */
exports.getFlaggedMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { isFlagged: true },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { 
          model: Conversation, 
          include: [
            { model: User, as: 'user1', attributes: ['id', 'username'] },
            { model: User, as: 'user2', attributes: ['id', 'username'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error getting flagged messages:', error);
    res.status(500).json({ error: 'Erreur récupération messages signalés' });
  }
};

/**
 * @swagger
 * /admin/conversations/{id}:
 *   delete:
 *     summary: Supprimer une conversation
 *     tags: [Admin]
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
 *         description: Conversation supprimée avec succès
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer d'abord tous les messages de la conversation
    await Message.destroy({
      where: { conversationId: id }
    });

    // Supprimer la conversation
    const deleted = await Conversation.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la conversation' });
  }
};

/**
 * @swagger
 * /admin/appointments/{id}:
 *   get:
 *     summary: Récupérer les détails d'un rendez-vous
 *     tags: [Admin]
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
 *         description: Détails du rendez-vous
 */
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'email', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'email', 'avatar'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Error getting appointment details:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails du rendez-vous' });
  }
};

/**
 * @swagger
 * /admin/appointments/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous
 *     tags: [Admin]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, declined, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'declined', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const [updated] = await Appointment.update(
      { status },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Créer une notification pour les utilisateurs concernés
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'requester' },
        { model: User, as: 'receiver' }
      ]
    });

    if (appointment) {
      const statusMessages = {
        'accepted': 'Votre rendez-vous a été accepté par un administrateur',
        'declined': 'Votre rendez-vous a été refusé par un administrateur',
        'cancelled': 'Votre rendez-vous a été annulé par un administrateur'
      };      if (statusMessages[status]) {
        await Notification.bulkCreate([
          {
            userId: appointment.requesterId,
            type: 'appointment_status',
            message: statusMessages[status]
          },
          {
            userId: appointment.receiverId,
            type: 'appointment_status',
            message: statusMessages[status]
          }
        ]);
      }
    }

    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

/**
 * @swagger
 * /admin/appointments/{id}:
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     tags: [Admin]
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
 *         description: Rendez-vous supprimé avec succès
 */
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous' });
  }
};
