const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsumableRequest = sequelize.define('ConsumableRequest', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  consumableId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'consumables',
      key: 'id',
    },
  },
  requestedById: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  requestType: {
    type: DataTypes.ENUM('Stock In', 'Stock Out'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1.' },
    },
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.ENUM('Training', 'Assessment', 'Replenishment'),
    allowNull: true,
  },
  course: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  trainer: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  approvedById: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'consumable_requests',
  timestamps: true,
  underscored: true,
});

// Define associations
ConsumableRequest.associate = (models) => {
  ConsumableRequest.belongsTo(models.Consumable, {
    foreignKey: 'consumableId',
    as: 'consumable',
  });
  ConsumableRequest.belongsTo(models.User, {
    foreignKey: 'requestedById',
    as: 'requestedBy',
  });
  ConsumableRequest.belongsTo(models.User, {
    foreignKey: 'approvedById',
    as: 'approvedBy',
  });
};

module.exports = ConsumableRequest;
