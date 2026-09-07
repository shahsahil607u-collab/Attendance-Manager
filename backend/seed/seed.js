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
      { fullName: 'Sahil Irshad', rollNumber: 'U19XH25S0051', email: 'shahsahil607u@gmail.com', phone: '9541868533', department: 'BCA', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Sheikh Thanaz', rollNumber: 'CS002', email: 'arjun.kumar@student.edu', phone: '9876543211', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Sai Mounish', rollNumber: 'CS003', email: 'sneha.rao@student.edu', phone: '9876543212', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Sagarika Giri', rollNumber: 'CS004', email: 'amit.patel@student.edu', phone: '9876543213', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Aishwariya', rollNumber: 'CS005', email: 'priya.nair@student.edu', phone: '9876543214', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Purshottam', rollNumber: 'CS006', email: 'vikram.singh@student.edu', phone: '9876543215', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Nirogi Abhishek', rollNumber: 'CS007', email: 'ananya.gupta@student.edu', phone: '9876543216', department: 'Computer Science', semester: 7, year: 4, team: 'Technical Team' },
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
    console.log(`Created ${students.length} students`);

    // Create default settings
    await Setting.create({ key: 'attendanceThreshold', value: 75, description: 'Minimum attendance percentage required' });
    await Setting.create({ key: 'teamName', value: 'Technical Team', description: 'Name of the technical team' });
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
