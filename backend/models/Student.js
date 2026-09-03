const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Roll number cannot exceed 20 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s()-]{7,15}$/, 'Please enter a valid phone number'],
  },
  department: {
    type: String,
    trim: true,
    default: 'Computer Science',
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8'],
  },
  year: {
    type: Number,
    min: [1, 'Year must be between 1 and 4'],
    max: [4, 'Year must be between 1 and 4'],
  },
  team: {
    type: String,
    trim: true,
    default: 'Technical Team',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

studentSchema.index({ isActive: 1 });
studentSchema.index({ fullName: 'text', rollNumber: 'text' });

module.exports = mongoose.model('Student', studentSchema);
