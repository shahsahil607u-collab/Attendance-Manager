const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');
const { getAbsentEmailHtml } = require('../templates/absentEmail');
const { createAuditLog } = require('../services/auditService');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, sessionId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (sessionId) query.sessionId = sessionId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(query).populate('studentId', 'fullName rollNumber email').populate('sessionId', 'sessionName date topic').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);
    res.json({ success: true, data: { notifications, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
};

const retryNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('studentId', 'fullName rollNumber email').populate('sessionId', 'sessionName date topic startTime endTime');
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    if (notification.status === 'sent') return res.status(400).json({ success: false, message: 'Notification already sent.' });

    let result;
    if (notification.type === 'absent_email' && notification.studentId) {
      const html = getAbsentEmailHtml({ studentName: notification.studentId.fullName, date: notification.sessionId.date, sessionName: notification.sessionId.sessionName, topic: notification.sessionId.topic, startTime: notification.sessionId.startTime, endTime: notification.sessionId.endTime });
      result = await sendEmail({ to: notification.recipient, subject: `Attendance Notification – ${notification.sessionId.sessionName}`, html });
    } else {
      result = await sendEmail({ to: notification.recipient, subject: `Attendance Report – ${notification.sessionId?.sessionName || 'Session'}`, html: '<p>Attendance report retry</p>' });
    }

    notification.retryCount += 1;
    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.errorMessage = undefined;
      await createAuditLog({ action: 'EMAIL_SENT', performedBy: req.user._id, targetType: 'Notification', targetId: notification._id, description: `Retry successful for ${notification.recipient}` });
    } else {
      notification.status = 'failed';
      notification.errorMessage = result.error;
      await createAuditLog({ action: 'EMAIL_FAILED', performedBy: req.user._id, targetType: 'Notification', targetId: notification._id, description: `Retry failed for ${notification.recipient}: ${result.error}` });
    }
    await notification.save();
    res.json({ success: true, message: result.success ? 'Notification sent successfully.' : 'Retry failed.', data: notification });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, retryNotification };
