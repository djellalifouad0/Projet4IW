const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('data');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('data', value ? JSON.stringify(value) : null);
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
,
}, {
  freezeTableName: true
});

User.hasMany(Notification, { foreignKey: 'userId' ,
}, {
  freezeTableName: true
});
Notification.belongsTo(User, { foreignKey: 'userId' ,
}, {
  freezeTableName: true
});

module.exports = Notification;
