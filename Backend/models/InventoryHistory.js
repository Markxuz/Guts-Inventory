const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryHistory = sequelize.define('InventoryHistory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  consumableId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  actionType: {
    type: DataTypes.ENUM('Stock In', 'Stock Out', 'Update', 'Archive'),
    allowNull: false,
  },
  quantityChanged: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  performedBy: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'System',
  },
}, {
  tableName: 'inventory_history',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = InventoryHistory;
