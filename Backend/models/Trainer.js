const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trainer = sequelize.define('Trainer', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [3, 150],
    },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: { name: 'unique_trainer_email' },
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of categories assigned to trainer (e.g., ["CSS", "SMAW", "EIM"])',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'trainers',
  timestamps: true,
  underscored: true,
});

module.exports = Trainer;
