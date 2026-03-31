require('dotenv').config();
const sequelize = require('./config/database');
const Consumable = require('./models/Consumable');
const InventoryHistory = require('./models/InventoryHistory');

// ─── EMPTY DATA: User will add their own items ────────────────────────────────
const seedData = [];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connected.');

    await sequelize.sync({ alter: true });
    console.log('✔  Tables synchronized.');

    // Wipe existing records
    await InventoryHistory.destroy({ where: {}, truncate: true });
    await Consumable.destroy({ where: {}, truncate: true });
    console.log('✔  All consumables and history cleared!');
    console.log('✔  Database is ready for new items.');
  } catch (err) {
    console.error('✖  Reset failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
