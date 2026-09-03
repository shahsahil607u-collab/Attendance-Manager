require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Setting = require('../models/Setting');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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
      email: 'hod@techteam.edu',
      passwordHash: 'hod123456',
      role: 'hod',
    });
    console.log('Created HOD:', hod.email);

    // Create sample students
    const students = [
      { fullName: 'Rahul Sharma', rollNumber: 'CS001', email: 'rahul.sharma@student.edu', phone: '9876543210', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Arjun Kumar', rollNumber: 'CS002', email: 'arjun.kumar@student.edu', phone: '9876543211', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Sneha Rao', rollNumber: 'CS003', email: 'sneha.rao@student.edu', phone: '9876543212', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Amit Patel', rollNumber: 'CS004', email: 'amit.patel@student.edu', phone: '9876543213', department: 'Computer Science', semester: 5, year: 3, team: 'Technical Team' },
      { fullName: 'Priya Nair', rollNumber: 'CS005', email: 'priya.nair@student.edu', phone: '9876543214', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
      { fullName: 'Vikram Singh', rollNumber: 'CS006', email: 'vikram.singh@student.edu', phone: '9876543215', department: 'Computer Science', semester: 3, year: 2, team: 'Technical Team' },
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
    console.log(`Created ${students.length} students`);

    // Create default settings
    await Setting.create({ key: 'attendanceThreshold', value: 75, description: 'Minimum attendance percentage required' });
    await Setting.create({ key: 'teamName', value: 'Technical Team', description: 'Name of the technical team' });
    console.log('Created default settings');

    console.log('\n✓ Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('  Coordinator: coordinator@techteam.edu / coordinator123');
    console.log('  HOD:         hod@techteam.edu / hod123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
