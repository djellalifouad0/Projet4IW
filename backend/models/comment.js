const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Skill = require('./skill');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

Skill.hasMany(Comment, { foreignKey: 'skillId', onDelete: 'CASCADE' });
Comment.belongsTo(Skill, { foreignKey: 'skillId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Association pour les réponses imbriquées
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

module.exports = Comment;
