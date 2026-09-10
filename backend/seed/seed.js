require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Setting = require('../models/Setting');

const { MongoMemoryServer } = require('mongodb-memory-server');

const connectSeedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('Local MongoDB not available. Starting MongoMemoryServer for seed...');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('Connected to MongoMemoryServer');
  }
};

const seedData = async () => {
  try {
    await connectSeedDB();

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Setting.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const coordinator = await User.create({
      name: 'Sahil Irshad',
      email: 'coordinator@techteam.edu',
      passwordHash: 'coordinator123',
      role: 'coordinator',
    });
    console.log('Created coordinator:', coordinator.email);

    const hod = await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'sahilirshad875@gmail.com',
      passwordHash: 'hod123456',
      role: 'hod',
    });
    console.log('Created HOD:', hod.email);

    // Create sample students
    const students = [
      { fullName: 'Sahil Irshad', registrationNumber: 'U19XH25S0051', email: 'shahsahil607u@gmail.com', phone: '9541868533', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Shaik Thanaaz', registrationNumber: 'U18FU24S0023', email: 'skthanaaz@gmail.com', phone: '7569737111', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Sai Mounish Ashok', registrationNumber: 'U19XH25S0052', email: 'saimounish59@gmail.com', phone: '8310160136', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'AKAASH S', registrationNumber: 'U18FU24S0094', email: '8.akaash@gmail.com', phone: '9148171188', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Zaid Sharif', registrationNumber: 'U18FU24S0066', email: 'ziozaid78@gmail.com', phone: '7204436967', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Santhosh Gowda DA', registrationNumber: 'U18FU24S0047', email: 'santhoshagowda312@gmail.com', phone: '9986797021', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Taskeen Sultana', registrationNumber: 'U18FU24S0051', email: 'taskeensultana405@gmail.com', phone: '9880963303', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Abdul Hadi Pandit', registrationNumber: 'U18FU25S0020', email: 'pandithadipandit@gmail.com', phone: '7006756462', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Wajid Shafi', registrationNumber: 'U18FU25S0015', email: 'waajidshafi3@gmail.com', phone: '6005411979', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Rohan Desai', registrationNumber: 'IT002', email: 'rohan.desai@student.edu', phone: '9876543219', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Meera Iyer', registrationNumber: 'CS009', email: 'meera.iyer@student.edu', phone: '9876543220', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Aditya Verma', registrationNumber: 'CS010', email: 'aditya.verma@student.edu', phone: '9876543221', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Lakshmi Prasad', registrationNumber: 'IT003', email: 'lakshmi.prasad@student.edu', phone: '9876543222', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'Nikhil Reddy', registrationNumber: 'CS011', email: 'nikhil.reddy@student.edu', phone: '9876543223', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
      { fullName: 'Sanya Malhotra', registrationNumber: 'CS012', email: 'sanya.malhotra@student.edu', phone: '9876543224', department: 'BCA', semester: 5, year: 3, team: 'Anveshak Team' },
      { fullName: 'N.V.S.S Abhishek', registrationNumber: 'U19XH25S0036', email: 'abhishek27127@gmail.com', phone: '9035018208', department: 'BCA', semester: 3, year: 2, team: 'Anveshak Team' },
    ];

    await Student.insertMany(students);
    console.log(`Created ${students.length} students`);

    // Create default settings
    await Setting.create({ key: 'attendanceThreshold', value: 75, description: 'Minimum attendance percentage required' });
    await Setting.create({ key: 'teamName', value: 'Anveshak Team', description: 'Name of the technical team' });
    console.log('Created default settings');

    console.log('\n✓ Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('  Coordinator: coordinator@techteam.edu / coordinator123');
    console.log('  HOD:         sahilirshad875@gmail.com / hod123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
