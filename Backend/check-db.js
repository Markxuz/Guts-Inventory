const sequelize = require('./config/database');
const Course = require('./models/Course');
const Consumable = require('./models/Consumable');

const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connection established.\n');

    // Check courses
    const courses = await Course.findAll();
    console.log('📚 COURSES IN DATABASE:');
    if (courses.length === 0) {
      console.log('   ❌ NO COURSES FOUND!');
      console.log('   Run: docker compose exec backend npm run init-courses\n');
    } else {
      courses.forEach(c => {
        console.log(`   ✔  ${c.code} - ${c.name} (Active: ${c.isActive})`);
      });
      console.log();
    }

    // Check consumables
    const consumables = await Consumable.findAll();
    console.log('🛒 CONSUMABLES IN DATABASE:');
    if (consumables.length === 0) {
      console.log('   ℹ  No consumables yet.\n');
    } else {
      consumables.forEach(c => {
        console.log(`   - ${c.itemName} (${c.category}) - Qty: ${c.quantity}`);
      });
      console.log();
    }

    // Group consumables by category
    if (consumables.length > 0) {
      console.log('📊 CONSUMABLES BY CATEGORY:');
      const byCategory = {};
      consumables.forEach(c => {
        if (!byCategory[c.category]) byCategory[c.category] = [];
        byCategory[c.category].push(c.itemName);
      });
      Object.entries(byCategory).forEach(([cat, items]) => {
        console.log(`   ${cat}: ${items.join(', ')}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('✖  Error:', err.message);
    process.exit(1);
  }
};

checkDatabase();
