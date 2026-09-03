const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'LOGIN',
      'LOGOUT',
      'STUDENT_CREATED',
      'STUDENT_UPDATED',
      'STUDENT_DEACTIVATED',
      'SESSION_CREATED',
      'ATTENDANCE_SUBMITTED',
      'ATTENDANCE_CORRECTED',
      'REPORT_GENERATED',
      'EMAIL_SENT',
      'EMAIL_FAILED',
    ],
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetType: {
    type: String,
    trim: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for querying logs
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
