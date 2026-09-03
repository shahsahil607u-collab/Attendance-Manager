const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');
const { createAuditLog } = require('./auditService');
const { getAbsentEmailHtml } = require('../templates/absentEmail');
const { getHodReportHtml } = require('../templates/hodReport');

/**
 * Send absent notifications to all absent students for a session.
 * Non-blocking: failures are recorded but do not stop the process.
 */
const sendAbsentNotifications = async ({ session, absentRecords, performedBy }) => {
  const results = [];

  for (const record of absentRecords) {
    const student = record.studentId;
    if (!student || !student.email) continue;

    // Create notification record first
    const notification = await Notification.create({
      studentId: student._id,
      sessionId: session._id,
      type: 'absent_email',
      recipient: student.email,
      status: 'pending',
    });

    try {
      const html = getAbsentEmailHtml({
        studentName: student.fullName,
        date: session.date,
        sessionName: session.sessionName,
        topic: session.topic,
        startTime: session.startTime,
        endTime: session.endTime,
      });

      const result = await sendEmail({
        to: student.email,
        subject: `Attendance Notification – ${session.sessionName}`,
        html,
      });

      if (result.success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        if (result.previewUrl) notification.previewUrl = result.previewUrl;
        await notification.save();

        await createAuditLog({
          action: 'EMAIL_SENT',
          performedBy,
          targetType: 'Student',
          targetId: student._id,
          description: `Absent notification sent to ${student.fullName} (${student.email})`,
        });
      } else {
        notification.status = 'failed';
        notification.errorMessage = result.error;
        await notification.save();

        await createAuditLog({
          action: 'EMAIL_FAILED',
          performedBy,
          targetType: 'Student',
          targetId: student._id,
          description: `Failed to send absent notification to ${student.fullName}: ${result.error}`,
        });
      }

      results.push({ studentId: student._id, status: notification.status });
    } catch (error) {
      notification.status = 'failed';
      notification.errorMessage = error.message;
      await notification.save();
      results.push({ studentId: student._id, status: 'failed' });
    }
  }

  return results;
};

/**
 * Send HOD attendance report email.
 */
const sendHodReport = async ({ session, attendanceData, performedBy }) => {
  const hodEmail = process.env.HOD_EMAIL;

  if (!hodEmail) {
    console.warn('⚠ HOD_EMAIL not configured. Skipping HOD report.');
    return { success: false, error: 'HOD_EMAIL not configured' };
  }

  // Create notification record
  const notification = await Notification.create({
    sessionId: session._id,
    type: 'hod_report_email',
    recipient: hodEmail,
    status: 'pending',
  });

  try {
    const html = getHodReportHtml({
      session,
      ...attendanceData,
    });

    const result = await sendEmail({
      to: hodEmail,
      subject: `Attendance Report – ${session.sessionName} – ${new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      html,
    });

    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      if (result.previewUrl) notification.previewUrl = result.previewUrl;
      await notification.save();

      await createAuditLog({
        action: 'EMAIL_SENT',
        performedBy,
        targetType: 'Session',
        targetId: session._id,
        description: `HOD attendance report sent for ${session.sessionName}`,
      });

      return { success: true };
    } else {
      notification.status = 'failed';
      notification.errorMessage = result.error;
      await notification.save();

      await createAuditLog({
        action: 'EMAIL_FAILED',
        performedBy,
        targetType: 'Session',
        targetId: session._id,
        description: `Failed to send HOD report: ${result.error}`,
      });

      return { success: false, error: result.error };
    }
  } catch (error) {
    notification.status = 'failed';
    notification.errorMessage = error.message;
    await notification.save();
    return { success: false, error: error.message };
  }
};

module.exports = { sendAbsentNotifications, sendHodReport };
