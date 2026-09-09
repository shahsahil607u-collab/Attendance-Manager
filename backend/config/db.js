const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Seed initial demo data — only when ENABLE_DEMO_SEED=true.
 * Prevents demo credentials from existing in production.
 */
const seedInitialDataIfNeeded = async () => {
  if (process.env.ENABLE_DEMO_SEED !== 'true') {
    return;
  }

  const User = require('../models/User');
  const Student = require('../models/Student');
  const Setting = require('../models/Setting');

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial demo data into MongoDB...');
    await User.create({
      name: 'Sahil Irshad',
      email: 'coordinator@techteam.edu',
      passwordHash: 'coordinator123',
      role: 'coordinator',
    });

    await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'sahilirshad875@gmail.com',
      passwordHash: 'hod123456',
      role: 'hod',
    });

    const students = [
      { fullName: 'Sahil Irshad', registrationNumber: 'U19XH25S0051', email: 'shahsahil607u@gmail.com', phone: '9541868533', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Sheikh Thanaaz', registrationNumber: 'U18FU24S0023', email: 'skthanaaz@gmail.com', phone: '7569737111', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Sai Mounish Ashok', registrationNumber: 'U19XH25S0052', email: 'saimounish59@gmail.com', phone: '8310160136', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'AKAASH S', registrationNumber: 'U18FU24S0094', email: '8.akaash@gmail.com', phone: '9148171188', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Zaid Sharif', registrationNumber: 'U18FU24S0066', email: 'ziozaid78@gmail.com', phone: '7204436967', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Santhosh Gowda DA', registrationNumber: 'U18FU24S0047', email: 'santhoshagowda312@gmail.com', phone: '9986797021', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Taskeen Sultana', registrationNumber: 'U18FU24S0051', email: 'taskeensultana405@gmail.com', phone: '9880963303', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Abdul Hadi Pandit', registrationNumber: 'U18FU25S0020', email: 'pandithadipandit@gmail.com', phone: '7006756462', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Wajid Shafi', registrationNumber: 'U18FU25S0015', email: 'waajidshafi3@gmail.com', phone: '6005411979', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
    ];
    await Student.insertMany(students);

    await Setting.create({ key: 'attendanceThreshold', value: 75, description: 'Minimum attendance percentage required' });
    await Setting.create({ key: 'teamName', value: 'Anveshak Team', description: 'Name of the technical team' });

    console.log('✓ Demo data seeded successfully.');
    console.log('  Use demo credentials from .env.example or seed script.');
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedInitialDataIfNeeded();
  } catch (error) {
    console.warn(`Local MongoDB not found (${error.message}). Starting MongoMemoryServer...`);
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✓ Embedded MongoDB Memory Server Started & Connected at ${conn.connection.host}`);
      await seedInitialDataIfNeeded();
    } catch (memErr) {
      console.error(`MongoDB Memory Server Error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
