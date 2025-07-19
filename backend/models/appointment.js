

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Conversation',
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
  price: {
  type: DataTypes.FLOAT,
  allowNull: false
},
commission: {
  type: DataTypes.FLOAT,
  allowNull: false
},
totalPrice: {
  type: DataTypes.FLOAT,
  allowNull: false
},
paymentStatus: {
  type: DataTypes.STRING,
  defaultValue: 'unpaid' // unpaid, paid
},
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'cancelled'),
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  }
,
}, {
  freezeTableName: true
});

module.exports = Appointment;

