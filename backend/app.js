const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupAssociations } = require('./models/associations');

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const likeRoutes = require('./routes/likeRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// Swagger
const setupSwagger = require('./swagger/swagger');

// Créer l'app Express
const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ratings', ratingRoutes);

// Swagger
setupSwagger(app);

// Servir le frontend SPA
app.use(express.static(path.join(__dirname, 'frontend-build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
});


module.exports = app;
