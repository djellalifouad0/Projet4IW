const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
const Sentry = require('@sentry/node');
require('./instrument.js');

const app = require('./app');

const sequelize = require('./config/db');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
  logger.error(`Uncaught Exception: ${err}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
  logger.error(`Unhandled Rejection: ${reason}`);
});
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "http://localhost:8080",
      "http://srv908931.hstgr.cloud:3000",
      "http://srv908931.hstgr.cloud:5173",
      "http://srv908931.hstgr.cloud:8080",
      "http://srv908931.hstgr.cloud"
    ],
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token manquant'));
  }
  try {
    const decoded = jwt.verify(token, 'votre_clé_secrète');
    socket.userId = decoded.userId;
    socket.profileToken = decoded.profileToken;
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

const connectedUsers = new Map();
const userConversations = new Map();

io.on('connection', (socket) => {
  logger.info(`🔌 Utilisateur connecté: ${socket.userId}`);
  connectedUsers.set(socket.userId, socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    if (!userConversations.has(socket.userId)) {
      userConversations.set(socket.userId, new Set());
    }
    userConversations.get(socket.userId).add(conversationId);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    userConversations.get(socket.userId)?.delete(conversationId);
  });

  socket.on('send-message', (data) => {
    const { conversationId, message } = data;
    socket.to(`conversation-${conversationId}`).emit('new-message', {
      ...message,
      senderId: socket.userId,
      conversationId,
      fromMe: false
    });
  });

  socket.on('get-online-users', () => {
    socket.emit('online-users', Array.from(connectedUsers.keys()));
  });

  socket.broadcast.emit('user-connected', {
    userId: socket.userId,
    profileToken: socket.profileToken
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping
    });
  });

  socket.on('check-notifications', async () => {
    try {
      const notificationService = require('./services/notificationService');
      const unreadCount = await notificationService.getUnreadNotificationCount(socket.userId);
      socket.emit('notification-count-update', unreadCount);
    } catch {
      socket.emit('notification-count-update', 0);
    }
  });

  socket.on('message-delivered', ({ conversationId, messageId }) => {
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'delivered',
      conversationId
    });
  });

  socket.on('message-read', ({ conversationId, messageId }) => {
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'read',
      conversationId
    });
  });

  socket.on('disconnect', () => {
    logger.info(`Utilisateur déconnecté: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
    userConversations.delete(socket.userId);
    socket.broadcast.emit('user-disconnected', {
      userId: socket.userId
    });
  });
});

app.set('socketio', io);
const { setupAssociations } = require('./models/associations.js');

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connexion à la base de données OK');
    
    setupAssociations();

    // Use force: false to avoid dropping tables, and alter: true to update schema
    await sequelize.sync({ alter: true});
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const User = require('./models/user');

    await User.findOrCreate({
      where: { email: 'testuser1@example.com' },
      defaults: {
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: hashedPassword,
        role: 'user',
        profileToken: 'test1token',
        isActive: true,
        validationToken: 'test1validationtoken'
      }
    });

    await User.findOrCreate({
      where: { email: 'testuser2@example.com' },
      defaults: {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: hashedPassword,
        role: 'user',
        profileToken: 'test2token',
        isActive: true,
        validationToken: 'test2validationtoken'
      }
    });
    
    server.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
      console.log(`Swagger sur http://localhost:${PORT}/api-docs`);
      console.log(`WebSocket activé`);
    });
  } catch (err) {
    logger.error('Échec de démarrage', err);
    process.exit(1);
  }
})();

