const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Skill = require('./skill');

const Like = sequelize.define('Like', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Associations définies ici pour éviter les boucles d'import !
Skill.hasMany(Like, { foreignKey: 'skillId', onDelete: 'CASCADE' });
Like.belongsTo(Skill, { foreignKey: 'skillId' });
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

module.exports = Like;
