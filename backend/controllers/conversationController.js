const { User, Conversation, Message } = require('../models/associations');
const { Op } = require('sequelize');

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
    });

    const formattedMessages = messages.map(msg => ({
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
    });

    // Mettre à jour la conversation
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: new Date()
    });

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
