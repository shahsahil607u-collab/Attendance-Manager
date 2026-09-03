const mongoose = require('mongoose');

const correctionSchema = new mongoose.Schema({
  previousStatus: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
  newStatus: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Correction reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  correctedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  correctedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: [true, 'Attendance status is required'],
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  correctionHistory: [correctionSchema],
}, {
  timestamps: true,
});

// CRITICAL: Compound unique index prevents duplicate attendance
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1 });
attendanceSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
