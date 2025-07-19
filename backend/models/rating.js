

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rating = sequelize.define('Rating', {
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  raterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  ratedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['raterId', 'ratedUserId']
    }
  ],
  validate: {
    cannotRateSelf() {
      if (this.raterId === this.ratedUserId) {
        throw new Error('Un utilisateur ne peut pas se noter lui-même');
      }
    }
  }
,
}, {
  freezeTableName: true
});

module.exports = Rating;

