const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger/swagger');
const skillRoutes = require('./routes/skillRoutes');
const commentRoutes = require('./routes/commentRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const likeRoutes = require('./routes/likeRoutes')
const app = express();

// ➕ Middlewares globaux
app.use(cors());
app.use(express.json());

// ➕ Routes API
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes', likeRoutes);
// ➕ Swagger (dispo sur /api-docs)
setupSwagger(app);

// ➕ Sync DB
sequelize.sync({ alter: true }).then(() => {
  console.log('🗄️  Base de données synchronisée (alter)');
});

module.exports = app;
