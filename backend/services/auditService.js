const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry.
 * This function is fire-and-forget; it should never block the main flow.
 */
const createAuditLog = async ({ action, performedBy, targetType, targetId, description, metadata }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      description,
      metadata,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Audit log creation failed:', error.message);
  }
};

module.exports = { createAuditLog };
