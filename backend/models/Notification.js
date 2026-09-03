const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  type: {
    type: String,
    enum: ['absent_email', 'hod_report_email'],
    required: true,
  },
  recipient: {
    type: String,
    required: [true, 'Recipient email is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  sentAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  previewUrl: {
    type: String,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ sessionId: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ studentId: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
