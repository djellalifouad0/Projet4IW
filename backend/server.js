const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// 🔐 PORT depuis variable d'environnement ou défaut 5000
const PORT = process.env.PORT || 5000;

// Créer le serveur HTTP
const server = http.createServer(app);

// Configurer Socket.IO avec CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"], // URLs du frontend + serveur de test
    methods: ["GET", "POST"]
  }
});

// Middleware d'authentification pour Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token manquant'));
  }
  try {
    const decoded = jwt.verify(token, 'votre_clé_secrète'); // Utiliser la même clé que authController
    socket.userId = decoded.userId;
    socket.profileToken = decoded.profileToken;
    next();
  } catch (error) {
    next(new Error('Token invalide'));
  }
});

// Gestion des connexions WebSocket
const connectedUsers = new Map();
const userConversations = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Utilisateur connecté: ${socket.userId}`);
  
  // Ajouter l'utilisateur à la liste des connectés
  connectedUsers.set(socket.userId, socket.id);
    // Rejoindre une conversation
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    
    if (!userConversations.has(socket.userId)) {
      userConversations.set(socket.userId, new Set());
    }
    userConversations.get(socket.userId).add(conversationId);
    
    console.log(`👥 Utilisateur ${socket.userId} a rejoint la conversation ${conversationId}`);
  });
    // Quitter une conversation
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    
    if (userConversations.has(socket.userId)) {
      userConversations.get(socket.userId).delete(conversationId);
    }
    
    console.log(`👋 Utilisateur ${socket.userId} a quitté la conversation ${conversationId}`);
  });
  // Envoyer un message (pour notifications en temps réel seulement)
  socket.on('send-message', (data) => {
    const { conversationId, message } = data;
    
    // Diffuser le message à tous les participants de la conversation (SAUF l'expéditeur)
    socket.to(`conversation-${conversationId}`).emit('new-message', {
      id: message.id,
      content: message.content,
      senderId: socket.userId,
      senderName: message.senderName,
      createdAt: message.createdAt,
      conversationId: conversationId,
      fromMe: false // Pour les autres participants
    });
    
    console.log(`💬 Message WebSocket diffusé dans la conversation ${conversationId} par ${socket.userId}`);
  });

  // Gestion des statuts de connexion
  socket.on('get-online-users', () => {
    const onlineUsers = Array.from(connectedUsers.keys());
    socket.emit('online-users', onlineUsers);
  });

  // Notification de connexion aux autres utilisateurs
  socket.broadcast.emit('user-connected', {
    userId: socket.userId,
    profileToken: socket.profileToken
  });
    // Indicateur de frappe
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping
    });
    console.log(`⌨️  Utilisateur ${socket.userId} ${isTyping ? 'tape' : 'arrête de taper'} dans la conversation ${conversationId}`);
  });

  // ====== GESTION DES NOTIFICATIONS EN TEMPS RÉEL ======
  
  // Demande de vérification des notifications
  socket.on('check-notifications', async () => {
    try {
      console.log(`🔔 Vérification des notifications pour l'utilisateur ${socket.userId}`);
      
      // Importer le service de notifications si pas déjà fait
      const notificationService = require('./services/notificationService');
      
      // Récupérer le nombre de notifications non lues pour cet utilisateur
      const unreadCount = await notificationService.getUnreadNotificationCount(socket.userId);
      
      // Envoyer le nombre à cet utilisateur spécifiquement
      socket.emit('notification-count-update', unreadCount);
      
      console.log(`📊 Nombre de notifications non lues pour ${socket.userId}: ${unreadCount}`);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des notifications:', error);
      socket.emit('notification-count-update', 0); // Fallback
    }
  });

  // Demande explicite du nombre de notifications non lues
  socket.on('get-notification-count', async () => {
    try {
      const notificationService = require('./services/notificationService');
      const unreadCount = await notificationService.getUnreadNotificationCount(socket.userId);
      socket.emit('notification-count-update', unreadCount);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du nombre de notifications:', error);
      socket.emit('notification-count-update', 0);
    }
  });

  // Gestion des messages en temps réel avec notifications
  socket.on('message-delivered', (data) => {
    const { conversationId, messageId } = data;
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'delivered',
      conversationId
    });
  });

  socket.on('message-read', (data) => {
    const { conversationId, messageId } = data;
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'read',
      conversationId
    });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`🔌 Utilisateur déconnecté: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    userConversations.delete(socket.userId);
    
    // Notifier les autres utilisateurs de la déconnexion
    socket.broadcast.emit('user-disconnected', {
      userId: socket.userId
    });
  });
});

// Exporter io pour l'utiliser dans les contrôleurs
app.set('socketio', io);

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📘 Swagger dispo sur http://localhost:${PORT}/api-docs`);
  console.log(`🔌 WebSocket activé`);
});
