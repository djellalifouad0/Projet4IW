

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
    type: DataTypes.TEXT,
    allowNull: true,
    description: 'URL of the user avatar image'
  },
  totpSecret: {
  type: DataTypes.STRING,
  allowNull: true,
}, 
  cover: {
    type: DataTypes.TEXT,
    allowNull: true,
    description: 'URL of the user cover image'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User biography/description'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'User address/location'
  },
    validationToken: { type: DataTypes.STRING, allowNull: true },
  profileToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  resetToken: {
  type: DataTypes.STRING,
  allowNull: true
},
resetTokenExpires: {
  type: DataTypes.DATE,
  allowNull: true
},
  notificationSettings: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string containing user notification preferences'
  }
}, {
  hooks: {
    beforeUpdate: (user) => {
      if (user.changed('profileToken')) {
        throw new Error('profileToken cannot be updated');
      }
    }
  },
  tableName: 'User',
  freezeTableName: true
});

module.exports = User;

