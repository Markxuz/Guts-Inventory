const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('stock_added', 'stock_removed', 'consumable_added', 'report_printed'),
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  staffName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  consumableName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [],
});

module.exports = Notification;
