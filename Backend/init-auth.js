const sequelize = require('./config/database');
const User = require('./models/User');
const Trainer = require('./models/Trainer');
const Consumable = require('./models/Consumable');
const InventoryHistory = require('./models/InventoryHistory');
const Notification = require('./models/Notification');

const initializeAdminUser = async () => {
  let connection = null;
  try {
    // Test connection
    connection = await sequelize.authenticate();
    console.log('✔  Database connection established.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✔  Models synchronized.');

    // Check if admin already exists
    const existingAdmin = await User.count({ where: { username: 'admin' } });
    if (existingAdmin > 0) {
      console.log('✔  Admin user already exists. Skipping creation.');
    } else {
      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@vailacademy.org',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
      }, { validate: true });
      console.log('✔  Admin user created successfully.');
      console.log('   Username: admin');
      console.log('   Email: admin@vailacademy.org');
      console.log('   Password: admin123');
    }

    // Check if staff already exists
    const existingStaff = await User.count({ where: { username: 'staff' } });
    if (existingStaff > 0) {
      console.log('✔  Staff user already exists. Skipping creation.');
    } else {
      // Create staff user
      const staffUser = await User.create({
        username: 'staff',
        email: 'staff@vailacademy.org',
        password: 'staff123',
        fullName: 'Staff Member',
        role: 'staff',
        isActive: true,
      }, { validate: true });
      console.log('✔  Staff user created successfully.');
      console.log('   Username: staff');
      console.log('   Email: staff@vailacademy.org');
      console.log('   Password: staff123');
    }

    console.log('\n✔  Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('✖  Initialization Error:');
    console.error('   Message:', err.message);
    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach((e, idx) => {
        console.error(`   Error ${idx + 1}:`, e.message, e.type);
      });
    }
    console.error('   Stack:', err.stack);
    process.exit(0); // Exit with 0 to prevent restart loop
  }
};

initializeAdminUser();
