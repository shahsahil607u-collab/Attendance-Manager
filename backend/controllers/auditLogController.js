const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action, startDate, endDate } = req.query;
    const query = {};
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query).populate('performedBy', 'name email role').sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
      AuditLog.countDocuments(query),
    ]);
    res.json({ success: true, data: { logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
};

const deleteAuditLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }
    res.json({ success: true, message: 'Audit log deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const clearAuditLogs = async (req, res, next) => {
  try {
    const { action } = req.query;
    const query = {};
    if (action) query.action = action;
    const result = await AuditLog.deleteMany(query);
    res.json({ success: true, message: `Deleted ${result.deletedCount} audit log(s) successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs, deleteAuditLog, clearAuditLogs };
