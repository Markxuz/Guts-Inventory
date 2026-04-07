const sequelize = require('./config/database');
const User = require('./models/User');
const Trainer = require('./models/Trainer');
const Consumable = require('./models/Consumable');
const InventoryHistory = require('./models/InventoryHistory');
const Notification = require('./models/Notification');

const initializeAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('✔  Models synchronized.');

    // Create default admin user
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });

    if (existingAdmin) {
      console.log('✔  Admin user already exists.');
    } else {
      await User.create({
        username: 'admin',
        email: 'admin@thevailacademy.org',
        password: 'admin123', // This will be hashed automatically
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
      });
      console.log('✔  Admin user created successfully.');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠  Please change this password after first login!');
    }

    // Create default staff user
    const existingStaff = await User.findOne({ where: { username: 'staff' } });

    if (existingStaff) {
      console.log('✔  Staff user already exists.');
    } else {
      await User.create({
        username: 'staff',
        email: 'staff@thevailacademy.org',
        password: 'staff123', // This will be hashed automatically
        fullName: 'Staff Member',
        role: 'staff',
        isActive: true,
      });
      console.log('✔  Staff user created successfully.');
      console.log('   Username: staff');
      console.log('   Password: staff123');
      console.log('   ⚠  Please change this password after first login!');
    }

    console.log('\n✔  Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('✖  Initialization failed:', err.message);
    process.exit(1);
  }
};

initializeAdminUser();
