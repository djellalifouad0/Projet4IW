// models/skill.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Skill = sequelize.define('Skill', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pricePerHour: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'Skills'
});

Skill.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Skill, { foreignKey: 'userId' });

module.exports = Skill;