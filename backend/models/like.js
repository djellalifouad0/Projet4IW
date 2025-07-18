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
,
}, {
  freezeTableName: true
});

Skill.hasMany(Like, { foreignKey: 'skillId', onDelete: 'CASCADE' ,
}, {
  freezeTableName: true
});
Like.belongsTo(Skill, { foreignKey: 'skillId' ,
}, {
  freezeTableName: true
});
User.hasMany(Like, { foreignKey: 'userId' ,
}, {
  freezeTableName: true
});
Like.belongsTo(User, { foreignKey: 'userId' ,
}, {
  freezeTableName: true
});

module.exports = Like;

