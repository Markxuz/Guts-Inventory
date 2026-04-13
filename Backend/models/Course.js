const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { name: 'unique_course_name' },
    validate: {
      notEmpty: { msg: 'Course name cannot be empty' },
      len: [2, 100],
    },
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { name: 'unique_course_code' },
    validate: {
      notEmpty: { msg: 'Course code cannot be empty' },
      len: [1, 50],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});

module.exports = Course;
