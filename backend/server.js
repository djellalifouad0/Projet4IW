const app = require('./app')
const http = require('http')
const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')
const logger = require('./utils/logger');
require("./instrument.js");
const Sentry = require("@sentry/node");
// Gestion globale des exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  process.exit(1); // tu peux laisser tourner si tu veux
});

// Gestion globale des promesses rejetées
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  // process.exit(1); // optionnel
});
// 🔐 PORT depuis variable d'environnement ou défaut 5000
const PORT = process.env.PORT || 5000

// Créer le serveur HTTP
const server = http.createServer(app)

// Configurer Socket.IO avec CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Token manquant'))
  }
  try {
    const decoded = jwt.verify(token, 'votre_clé_secrète')
    socket.userId = decoded.userId
    socket.profileToken = decoded.profileToken
    next()
  } catch {
    next(new Error('Token invalide'))
  }
})

const connectedUsers = new Map()
const userConversations = new Map()

io.on('connection', (socket) => {
  console.log(`🔌 Utilisateur connecté: ${socket.userId}`)

  connectedUsers.set(socket.userId, socket.id)

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`)
    if (!userConversations.has(socket.userId)) {
      userConversations.set(socket.userId, new Set())
    }
    userConversations.get(socket.userId).add(conversationId)
  })

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`)
    if (userConversations.has(socket.userId)) {
      userConversations.get(socket.userId).delete(conversationId)
    }
  })

  socket.on('send-message', (data) => {
    const { conversationId, message } = data
    socket.to(`conversation-${conversationId}`).emit('new-message', {
      id: message.id,
      content: message.content,
      senderId: socket.userId,
      senderName: message.senderName,
      createdAt: message.createdAt,
      conversationId,
      fromMe: false
    })
  })

  socket.on('get-online-users', () => {
    socket.emit('online-users', Array.from(connectedUsers.keys()))
  })

  socket.broadcast.emit('user-connected', {
    userId: socket.userId,
    profileToken: socket.profileToken
  })

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation-${conversationId}`).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping
    })
  })

  socket.on('check-notifications', async () => {
    try {
      const notificationService = require('./services/notificationService')
      const unreadCount = await notificationService.getUnreadNotificationCount(socket.userId)
      socket.emit('notification-count-update', unreadCount)
    } catch {
      socket.emit('notification-count-update', 0)
    }
  })

  socket.on('get-notification-count', async () => {
    try {
      const notificationService = require('./services/notificationService')
      const unreadCount = await notificationService.getUnreadNotificationCount(socket.userId)
      socket.emit('notification-count-update', unreadCount)
    } catch {
      socket.emit('notification-count-update', 0)
    }
  })

  socket.on('message-delivered', ({ conversationId, messageId }) => {
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'delivered',
      conversationId
    })
  })
  socket.on('message-read', ({ conversationId, messageId }) => {
    socket.to(`conversation-${conversationId}`).emit('message-status', {
      messageId,
      status: 'read',
      conversationId
    })
  })
  socket.on('disconnect', () => {
    console.log(`🔌 Utilisateur déconnecté: ${socket.userId}`)
    connectedUsers.delete(socket.userId)
    userConversations.delete(socket.userId)
    socket.broadcast.emit('user-disconnected', {
      userId: socket.userId
    })
  })
})
app.set('socketio', io)
const sequelize  = require('./config/db');


async function connectWithRetry(retries = 10, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established');
      return sequelize;
    } catch (err) {
      console.error(`Attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        console.log(`Waiting ${delay / 1000}s before retrying...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('🔥 All attempts to connect to the database failed. Exiting.');
        process.exit(1);
      }
    }
  }
}


  ;(async () => {
 await connectWithRetry();
Sentry.setupExpressErrorHandler(app);
    const AdminJS = (await import('adminjs')).default
    const AdminJSExpress = (await import('@adminjs/express')).default
    const AdminJSSequelize = (await import('@adminjs/sequelize')).default
    const { sequelize } = require('./models')
    
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
  console.log(`📘 Swagger dispo sur http://localhost:${PORT}/api-docs`)
  console.log(`🔌 WebSocket activé`)
    // 🔗 Enregistre l'adapter Sequelize
    AdminJS.registerAdapter(AdminJSSequelize)

    console.log('✅ AdminJS Sequelize adapter enregistré')

    const adminJs = new AdminJS({
      databases: [sequelize],
      rootPath: '/admin',
      dashboard: {
        handler: async () => {
          const [
            totalUsers,
            totalAdmins,
            activeUsers,
            inactiveUsers,
            pendingAppointments,
            acceptedAppointments,
            declinedAppointments,
            cancelledAppointments,
            totalConversations,
            totalMessages,
            totalNotifications,
            unreadNotifications,
            totalRatings,
            avgRating,
            activeSkills,
            inactiveSkills,
            totalLikes,
            totalComments,
          ] = await Promise.all([
            sequelize.query(`SELECT COUNT(*) AS count FROM User;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM User WHERE role = 'admin';`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM User WHERE isActive = true;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM User WHERE isActive = false;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),

            sequelize.query(`SELECT COUNT(*) AS count FROM Appointment WHERE status = 'pending';`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Appointment WHERE status = 'accepted';`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Appointment WHERE status = 'declined';`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Appointment WHERE status = 'cancelled';`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),

            sequelize.query(`SELECT COUNT(*) AS count FROM Conversation;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Message;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),

            sequelize.query(`SELECT COUNT(*) AS count FROM Notification;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Notification WHERE \`read\` = false;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),

            sequelize.query(`SELECT COUNT(*) AS count FROM Rating;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT AVG(rating) AS avg FROM Rating;`, { type: sequelize.QueryTypes.SELECT }).then(r => parseFloat(r[0].avg || 0).toFixed(2)),

            sequelize.query(`SELECT COUNT(*) AS count FROM Skill WHERE isActive = true;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Skill WHERE isActive = false;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),

            sequelize.query(`SELECT COUNT(*) AS count FROM \`Like\`;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
            sequelize.query(`SELECT COUNT(*) AS count FROM Comment;`, { type: sequelize.QueryTypes.SELECT }).then(r => r[0].count),
          ])

          return {
            totalUsers,
            totalAdmins,
            activeUsers,
            inactiveUsers,
            pendingAppointments,
            acceptedAppointments,
            declinedAppointments,
            cancelledAppointments,
            totalConversations,
            totalMessages,
            totalNotifications,
            unreadNotifications,
            totalRatings,
            avgRating,
            activeSkills,
            inactiveSkills,
            totalLikes,
            totalComments,
          }
        },
      },
      branding: {
        companyName: 'MySQL Admin Dashboard',
      },
    })

    const router = AdminJSExpress.buildRouter(adminJs)
    app.use(adminJs.options.rootPath, router)
    

    console.log(`✅ AdminJS disponible sur http://localhost:${PORT}${adminJs.options.rootPath}`)
  })()
})

