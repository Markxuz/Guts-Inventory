const sequelize = require('./config/database');
const Course = require('./models/Course');

const initializeCourses = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔  Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('✔  Models synchronized.');

    // Default courses
    const courses = [
      {
        name: 'Certified Supplemental Services',
        code: 'CSS',
        description: 'CSS Training Program',
        isActive: true,
      },
      {
        name: 'Shielded Metal Arc Welding',
        code: 'SMAW',
        description: 'SMAW Training Program',
        isActive: true,
      },
      {
        name: 'Electrical Installation and Maintenance',
        code: 'EIM',
        description: 'EIM Training Program',
        isActive: true,
      },
    ];

    for (const courseData of courses) {
      const existing = await Course.findOne({ where: { code: courseData.code } });
      
      if (existing) {
        console.log(`✔  Course "${courseData.code}" already exists.`);
      } else {
        await Course.create(courseData);
        console.log(`✔  Course "${courseData.code}" created successfully.`);
      }
    }

    console.log('\n✔  Courses initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('✖  Initialization failed:', err.message);
    process.exit(1);
  }
};

initializeCourses();
