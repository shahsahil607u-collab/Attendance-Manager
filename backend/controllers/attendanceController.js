const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Student = require('../models/Student');
const { createAuditLog } = require('../services/auditService');

const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, records } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Attendance for this session has already been submitted.' });
    }
    const results = [];
    for (const record of records) {
      const attendance = await Attendance.findOneAndUpdate(
        { sessionId, studentId: record.studentId },
        { sessionId, studentId: record.studentId, status: record.status, markedBy: req.user._id, markedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
      );
      results.push(attendance);
    }
    res.json({ success: true, message: `Marked attendance for ${results.length} students.`, data: { saved: results.length } });
  } catch (error) { next(error); }
};

const getSessionAttendance = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    const attendance = await Attendance.find({ sessionId: req.params.sessionId })
      .populate('studentId', 'fullName rollNumber email phone').populate('markedBy', 'name');
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    res.json({ success: true, data: { session, attendance, summary: { totalStudents: attendance.length, presentCount, absentCount, attendancePercentage: attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0 } } });
  } catch (error) { next(error); }
};

const getStudentAttendance = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const attendance = await Attendance.find({ studentId: req.params.studentId })
      .populate('sessionId', 'date sessionName topic startTime endTime status').sort({ createdAt: -1 });
    const submitted = attendance.filter(a => a.sessionId && a.sessionId.status !== 'draft');
    const totalClasses = submitted.length;
    const presentCount = submitted.filter(a => a.status === 'present').length;
    res.json({ success: true, data: { student, attendance, summary: { totalClasses, presentCount, absentCount: totalClasses - presentCount, attendancePercentage: totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0 } } });
  } catch (error) { next(error); }
};

const correctAttendance = async (req, res, next) => {
  try {
    const { attendanceId, newStatus, reason } = req.body;
    const attendance = await Attendance.findById(attendanceId).populate('studentId', 'fullName rollNumber').populate('sessionId', 'sessionName date');
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    if (attendance.status === newStatus) return res.status(400).json({ success: false, message: `Already marked as ${newStatus}.` });
    const previousStatus = attendance.status;
    attendance.correctionHistory.push({ previousStatus, newStatus, reason, correctedBy: req.user._id, correctedAt: new Date() });
    attendance.status = newStatus;
    await attendance.save();
    await createAuditLog({ action: 'ATTENDANCE_CORRECTED', performedBy: req.user._id, targetType: 'Attendance', targetId: attendance._id, description: `Corrected: ${previousStatus} → ${newStatus}. Reason: ${reason}`, metadata: { previousStatus, newStatus, reason } });
    res.json({ success: true, message: 'Attendance corrected successfully.', data: attendance });
  } catch (error) { next(error); }
};

module.exports = { markAttendance, getSessionAttendance, getStudentAttendance, correctAttendance };
