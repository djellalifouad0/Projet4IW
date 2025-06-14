const { User, Conversation, Message } = require('../models/associations');
const { Op } = require('sequelize');
const NotificationService = require('../services/notificationService');

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: API de gestion des conversations
 */

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Récupère toutes les conversations de l'utilisateur
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'avatar', 'profileToken']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'avatar', 'profileToken']
        }
      ],
      order: [['lastMessageAt', 'DESC']]
    });

    // Récupérer le dernier message pour chaque conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          where: { conversationId: conv.id },
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username']
            }
          ]
        });

        // Déterminer qui est l'autre utilisateur
        const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            avatar: otherUser.avatar,
            profileToken: otherUser.profileToken
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId
          } : null,
          lastMessageAt: conv.lastMessageAt
        };
      })
    );

    res.json(conversationsWithLastMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération conversations' });
  }
};

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Crée une nouvelle conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileToken:
 *                 type: string
 *               initialMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation créée
 */
exports.createConversation = async (req, res) => {
  try {
    const { profileToken, initialMessage } = req.body;
    const userId = req.user.id;

    // Trouver l'utilisateur avec ce profileToken
    const otherUser = await User.findOne({ where: { profileToken } });
    if (!otherUser) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    if (otherUser.id === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas créer une conversation avec vous-même' });
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: userId, user2Id: otherUser.id },
          { user1Id: otherUser.id, user2Id: userId }
        ]
      }
    });

    let conversation;

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Créer une nouvelle conversation
      conversation = await Conversation.create({
        user1Id: Math.min(userId, otherUser.id), // Pour maintenir l'ordre
        user2Id: Math.max(userId, otherUser.id),
        lastMessageAt: new Date()
      });
    }

    // Créer le message initial s'il est fourni
    if (initialMessage && initialMessage.trim()) {
      const message = await Message.create({
        content: initialMessage.trim(),
        senderId: userId,
        conversationId: conversation.id
      });

      // Mettre à jour la conversation avec le dernier message
      await conversation.update({
        lastMessageId: message.id,
        lastMessageAt: new Date()
      });
    }

    res.status(201).json({
      id: conversation.id,
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        avatar: otherUser.avatar,
        profileToken: otherUser.profileToken
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur création conversation' });
  }
};

/**
 * @swagger
 * /conversations/{id}/messages:
 *   get:
 *     summary: Récupère les messages d'une conversation
 *     tags: [Conversations]
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
 *         description: Liste des messages
 */
exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
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

    const messages = await Message.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      fromMe: msg.senderId === userId,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        username: msg.sender.username,
        avatar: msg.sender.avatar
      }
    }));

    // Envoyer les statuts "read" via WebSocket pour les messages de l'autre utilisateur
    try {
      const io = req.app.get('socketio');
      if (io) {
        // Trouver les messages de l'autre utilisateur qui viennent d'être consultés
        const otherUserMessages = messages.filter(msg => msg.senderId !== userId);
        
        otherUserMessages.forEach(msg => {
          // Envoyer le statut "read" à l'expéditeur original
          io.to(`conversation-${conversationId}`).emit('message-status', {
            messageId: msg.id,
            status: 'read',
            conversationId: conversationId
          });
        });
        
        console.log(`📖 Envoyé ${otherUserMessages.length} statuts "read" pour la conversation ${conversationId}`);
      }
    } catch (socketError) {
      console.error('Erreur envoi statuts read via WebSocket:', socketError);
    }

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération messages' });
  }
};

/**
 * @swagger
 * /conversations/{id}/messages:
 *   post:
 *     summary: Envoie un message dans une conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 */
exports.sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le contenu du message est requis' });
    }

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

    // Créer le message
    const message = await Message.create({
      content: content.trim(),
      senderId: userId,
      conversationId
    });    // Mettre à jour la conversation
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date()
    });    // Créer une notification pour le destinataire
    try {
      const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      const senderName = req.user.username;
      const io = req.app.get('socketio'); // Récupérer l'instance WebSocket
      await NotificationService.createNewMessageNotification(recipientId, senderName, io);
    } catch (notifError) {
      console.error('Erreur création notification message:', notifError);
    }

    // Récupérer le message avec les informations de l'expéditeur
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    // Émettre le message via WebSocket à tous les participants de la conversation
    const io = req.app.get('socketio');
    if (io) {
      io.to(`conversation-${conversationId}`).emit('new-message', {
        id: messageWithSender.id,
        content: messageWithSender.content,
        senderId: messageWithSender.senderId,
        senderName: messageWithSender.sender.username,
        createdAt: messageWithSender.createdAt,
        fromMe: false // Pour les autres participants
      });
    }

    res.status(201).json({
      id: messageWithSender.id,
      content: messageWithSender.content,
      senderId: messageWithSender.senderId,
      fromMe: true,
      createdAt: messageWithSender.createdAt,
      sender: {
        id: messageWithSender.sender.id,
        username: messageWithSender.sender.username,
        avatar: messageWithSender.sender.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur envoi message' });
  }
};

/**
 * @swagger
 * /conversations/unread-count:
 *   get:
 *     summary: Récupère le nombre de messages non lus
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de messages non lus
 */
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Compter les messages non lus où l'utilisateur n'est PAS l'expéditeur
    const unreadCount = await Message.count({
      include: [
        {
          model: Conversation,
          where: {
            [Op.or]: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          }
        }
      ],
      where: {
        senderId: { [Op.ne]: userId }, // Messages pas envoyés par l'utilisateur
        readAt: null // Messages non lus
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    res.status(500).json({ error: 'Erreur récupération messages non lus' });
  }
};

/**
 * @swagger
 * /conversations/{id}/mark-read:
 *   patch:
 *     summary: Marque tous les messages d'une conversation comme lus
 *     tags: [Conversations]
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
 *         description: Messages marqués comme lus
 */
exports.markConversationAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id;
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

    // Marquer tous les messages non lus de cette conversation comme lus
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId }, // Messages pas envoyés par l'utilisateur
          readAt: null
        }
      }
    );    res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Erreur marquage messages comme lus' });
  }
};

/**
 * @swagger
 * /conversations/{id}:
 *   delete:
 *     summary: Supprimer une conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la conversation
 *     responses:
 *       200:
 *         description: Conversation supprimée avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Conversation non trouvée
 */
exports.deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Vérifier que la conversation existe et que l'utilisateur y participe
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
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    // Supprimer tous les messages de la conversation
    await Message.destroy({
      where: { conversationId: conversationId }
    });

    // Supprimer la conversation
    await conversation.destroy();

    res.json({ success: true, message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la conversation' });
  }
};
