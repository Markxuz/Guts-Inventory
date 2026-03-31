const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consumable = sequelize.define('Consumable', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  itemName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'itemName cannot be empty.' },
    },
  },
  category: {
    type: DataTypes.ENUM('EIM', 'SMAW', 'CSS'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['EIM', 'SMAW', 'CSS']],
        msg: 'category must be one of: EIM, SMAW, CSS.',
      },
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'quantity cannot be negative.' },
    },
  },
  quantityMain: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'quantityMain cannot be negative.' },
    },
  },
  quantityAnnex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'quantityAnnex cannot be negative.' },
    },
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'unit cannot be empty.' },
    },
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: { args: [0], msg: 'reorderLevel cannot be negative.' },
    },
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'consumables',
  timestamps: true,
  // Maps camelCase JS names to snake_case DB columns:
  // itemName → item_name, reorderLevel → reorder_level
  // toJSON() still returns camelCase keys.
  underscored: true,
  indexes: [],
});

module.exports = Consumable;
