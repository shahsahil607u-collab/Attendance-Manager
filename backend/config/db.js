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
      { fullName: 'Sahil Irshad', rollNumber: 'U19XH25S0051', email: 'shahsahil607u@gmail.com', phone: '9541868533', department: 'BCA', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Sheikh Thanaz', rollNumber: 'CS002', email: 'arjun.kumar@student.edu', phone: '9876543211', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Sai Mounish', rollNumber: 'CS003', email: 'sneha.rao@student.edu', phone: '9876543212', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Sagarika Giri', rollNumber: 'CS004', email: 'amit.patel@student.edu', phone: '9876543213', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Aishwariya', rollNumber: 'CS005', email: 'priya.nair@student.edu', phone: '9876543214', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Purshottam', rollNumber: 'CS006', email: 'vikram.singh@student.edu', phone: '9876543215', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Ananya Gupta', rollNumber: 'CS007', email: 'ananya.gupta@student.edu', phone: '9876543216', department: 'Computer Science', semester: 7, year: 4, team: 'Technical Team' },
      { fullName: 'Karthik Menon', rollNumber: 'CS008', email: 'karthik.menon@student.edu', phone: '9876543217', department: 'Information Technology', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Divya Krishnan', rollNumber: 'IT001', email: 'divya.krishnan@student.edu', phone: '9876543218', department: 'Information Technology', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Rohan Desai', rollNumber: 'IT002', email: 'rohan.desai@student.edu', phone: '9876543219', department: 'Information Technology', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Meera Iyer', rollNumber: 'CS009', email: 'meera.iyer@student.edu', phone: '9876543220', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Aditya Verma', rollNumber: 'CS010', email: 'aditya.verma@student.edu', phone: '9876543221', department: 'Computer Science', semester: 7, year: 4, team: 'Technical Team' },
      { fullName: 'Lakshmi Prasad', rollNumber: 'IT003', email: 'lakshmi.prasad@student.edu', phone: '9876543222', department: 'Information Technology', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Nikhil Reddy', rollNumber: 'CS011', email: 'nikhil.reddy@student.edu', phone: '9876543223', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Sanya Malhotra', rollNumber: 'CS012', email: 'sanya.malhotra@student.edu', phone: '9876543224', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
    ];
    await Student.insertMany(students);

    await Setting.create({ key: 'attendanceThreshold', value: 75, description: 'Minimum attendance percentage required' });
    await Setting.create({ key: 'teamName', value: 'Technical Team', description: 'Name of the technical team' });

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
