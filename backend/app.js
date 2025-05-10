const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger/swagger');

const app = express();

// ➕ Middlewares globaux
app.use(cors());
app.use(express.json());

// ➕ Routes API
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

// ➕ Swagger (dispo sur /api-docs)
setupSwagger(app);

// ➕ Sync DB
sequelize.sync().then(() => {
  console.log('🗄️  Base de données synchronisée');
});

module.exports = app;
