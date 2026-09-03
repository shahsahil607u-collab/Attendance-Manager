const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true,
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true,
  },
  sessionName: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    maxlength: [200, 'Session name cannot exceed 200 characters'],
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'locked'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for querying
sessionSchema.index({ date: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Session', sessionSchema);
