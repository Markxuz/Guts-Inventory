require('dotenv').config();
const sequelize = require('./config/database');
const Consumable = require('./models/Consumable');
const InventoryHistory = require('./models/InventoryHistory');

// ─── 15 sample items: 5 per category ──────────────────────────────────────────
const seedData = [
  // ── EIM: Electrical Installation and Maintenance ──────────────────────────
  { itemName: 'PVC Conduit 20mm',    category: 'EIM',  quantity: 48,  unit: 'pcs',    reorderLevel: 10 },
  { itemName: 'Electrical Tape',     category: 'EIM',  quantity: 25,  unit: 'rolls',  reorderLevel: 15 },
  { itemName: 'Circuit Breaker 20A', category: 'EIM',  quantity: 8,   unit: 'pcs',    reorderLevel: 5  },
  { itemName: 'Junction Box',        category: 'EIM',  quantity: 14,  unit: 'pcs',    reorderLevel: 5  },
  { itemName: 'Wire 2.0mm (THHN)',   category: 'EIM',  quantity: 120, unit: 'meters', reorderLevel: 30 },

  // ── SMAW: Shielded Metal Arc Welding ──────────────────────────────────────
  { itemName: 'E6013 Welding Rod 3.2mm', category: 'SMAW', quantity: 26, unit: 'kg',    reorderLevel: 10 },
  { itemName: 'Chipping Hammer',         category: 'SMAW', quantity: 15, unit: 'pcs',   reorderLevel: 5  },
  { itemName: 'Welding Gloves',          category: 'SMAW', quantity: 9,  unit: 'pairs', reorderLevel: 5  },
  { itemName: 'Face Shield Lens',        category: 'SMAW', quantity: 18, unit: 'pcs',   reorderLevel: 8  },
  { itemName: 'Wire Brush',              category: 'SMAW', quantity: 22, unit: 'pcs',   reorderLevel: 10 },

  // ── CSS: Computer Systems Servicing ───────────────────────────────────────
  { itemName: 'RJ45 Connector',    category: 'CSS', quantity: 210, unit: 'pcs',    reorderLevel: 50 },
  { itemName: 'Cat6 Cable',        category: 'CSS', quantity: 58,  unit: 'meters', reorderLevel: 20 },
  { itemName: 'Crimping Tool',     category: 'CSS', quantity: 11,  unit: 'pcs',    reorderLevel: 3  },
  { itemName: 'LAN Tester',        category: 'CSS', quantity: 7,   unit: 'pcs',    reorderLevel: 2  },
  { itemName: 'Thermal Paste 4g',  category: 'CSS', quantity: 12,  unit: 'pcs',    reorderLevel: 5  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connected.');

    await sequelize.sync({ alter: true });
    console.log('✔  Tables synchronized.');

    // Wipe existing records so the seed is idempotent.
    await InventoryHistory.destroy({ where: {}, truncate: true });
    await Consumable.destroy({ where: {}, truncate: true });
    console.log('✔  Existing records cleared.');

    const created = await Consumable.bulkCreate(seedData, { validate: true });
    console.log(`✔  Seeded ${created.length} consumables.\n`);

    // Pretty-print per-category count
    const summary = created.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    console.table(summary);
  } catch (err) {
    console.error('✖  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
