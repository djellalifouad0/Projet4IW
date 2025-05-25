/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - requesterId
 *         - receiverId
 *         - appointmentDate
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: ID du rendez-vous
 *         requesterId:
 *           type: integer
 *           description: ID de l'utilisateur qui demande le rendez-vous
 *         receiverId:
 *           type: integer
 *           description: ID de l'utilisateur qui reçoit la demande
 *         conversationId:
 *           type: integer
 *           description: ID de la conversation associée
 *         title:
 *           type: string
 *           description: Titre du rendez-vous
 *         description:
 *           type: string
 *           description: Description optionnelle du rendez-vous
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *           description: Date et heure du rendez-vous
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined, cancelled]
 *           description: Statut du rendez-vous
 *         location:
 *           type: string
 *           description: Lieu du rendez-vous (optionnel)
 *       example:
 *         id: 1
 *         requesterId: 1
 *         receiverId: 2
 *         conversationId: 1
 *         title: "Échange de compétences"
 *         description: "Discussion sur le développement web"
 *         appointmentDate: "2025-05-26T14:00:00.000Z"
 *         status: "pending"
 *         location: "En ligne"
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Conversations',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'cancelled'),
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Appointment;
