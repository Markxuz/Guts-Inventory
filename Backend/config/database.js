const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Pangalan ng DB (hal. guts_db)
  process.env.DB_USER,     // Default ay 'root'
  process.env.DB_PASSWORD, // Password mo sa MySQL
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Para hindi makalat sa terminal
  }
);

module.exports = sequelize;