const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger/swagger');
const skillRoutes = require('./routes/skillRoutes');
const notificationRoutes = require('./routes/notificationRoutes')
const likeRoutes = require('./routes/likeRoutes')
const conversationRoutes = require('./routes/conversationRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')
// Importer les associations pour s'assurer qu'elles sont définies
require('./models/associations');
const app = express();

// ➕ Middlewares globaux
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ➕ Routes API
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/skills', skillRoutes);
// app.use('/api/comments', commentRoutes); // Désactivé car les routes sont maintenant dans /api/skills/:id/comments
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/appointments', appointmentRoutes);
// ➕ Swagger (dispo sur /api-docs)
setupSwagger(app);

// ➕ Test de connexion DB sans synchronisation pour éviter les contraintes
sequelize.authenticate().then(() => {
  console.log('🗄️  Connexion à la base de données établie');
}).catch((error) => {
  console.error('❌ Erreur de connexion DB:', error.message);
});

module.exports = app;
