/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID utilisateur
 *         username:
 *           type: string
 *           description: Nom affiché de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           description: Mot de passe hashé (null si Google OAuth)
 *         googleId:
 *           type: string
 *           description: ID OAuth Google (si applicable)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Statut actif ou désactivé
 *         avatar:
 *           type: string
 *           description: URL de l'image avatar de l'utilisateur
 *         cover:
 *           type: string
 *           description: URL de l'image de couverture de l'utilisateur
 *       example:
 *         id: 1
 *         username: "fouad"
 *         email: "fouad@example.com"
 *         role: "admin"
 *         isActive: true
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Peut être null pour Google Auth
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    description: 'URL of the user avatar image'
  },
  cover: {
    type: DataTypes.STRING,
    allowNull: true,
    description: 'URL of the user cover image'
  }
});

sequelize.sync({ alter: true });

module.exports = User;
