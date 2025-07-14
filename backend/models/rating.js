/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - rating
 *         - raterId
 *         - ratedUserId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de l'avis
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Note attribuée (de 1 à 5)
 *         comment:
 *           type: string
 *           description: Commentaire optionnel
 *         raterId:
 *           type: integer
 *           description: ID de l'utilisateur qui note
 *         ratedUserId:
 *           type: integer
 *           description: ID de l'utilisateur noté
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         rating: 5
 *         comment: "Excellente collaboration!"
 *         raterId: 1
 *         ratedUserId: 2
 */

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
