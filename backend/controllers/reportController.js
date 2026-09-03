const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Student = require('../models/Student');
const Setting = require('../models/Setting');

const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);
    const sessions = await Session.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'draft' } }).lean();
    const report = await Promise.all(sessions.map(async (session) => {
      const records = await Attendance.find({ sessionId: session._id }).populate('studentId', 'fullName rollNumber');
      const present = records.filter(r => r.status === 'present');
      const absent = records.filter(r => r.status === 'absent');
      return { session, totalStudents: records.length, presentCount: present.length, absentCount: absent.length, attendancePercentage: records.length > 0 ? (present.length / records.length) * 100 : 0, absentStudents: absent.filter(r => r.studentId).map(r => ({ fullName: r.studentId.fullName, rollNumber: r.studentId.rollNumber })) };
    }));
    res.json({ success: true, data: { date: targetDate.toISOString().split('T')[0], sessions: report } });
  } catch (error) { next(error); }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const sessions = await Session.find({ date: { $gte: startDate, $lte: endDate }, status: { $ne: 'draft' } }).lean();
    const students = await Student.find({ isActive: true }).lean();
    const thresholdSetting = await Setting.findOne({ key: 'attendanceThreshold' });
    const threshold = thresholdSetting ? thresholdSetting.value : 75;
    const studentStats = await Promise.all(students.map(async (student) => {
      const records = await Attendance.find({ studentId: student._id, sessionId: { $in: sessions.map(s => s._id) } });
      const present = records.filter(r => r.status === 'present').length;
      const total = records.length;
      return { student: { _id: student._id, fullName: student.fullName, rollNumber: student.rollNumber }, totalClasses: total, presentCount: present, absentCount: total - present, attendancePercentage: total > 0 ? (present / total) * 100 : 0 };
    }));
    const totalSessions = sessions.length;
    const avgAttendance = studentStats.length > 0 ? studentStats.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentStats.length : 0;
    const belowThreshold = studentStats.filter(s => s.totalClasses > 0 && s.attendancePercentage < threshold);
    res.json({ success: true, data: { month: m, year: y, totalSessions, totalStudents: students.length, averageAttendance: avgAttendance, threshold, studentStats, belowThreshold } });
  } catch (error) { next(error); }
};

const getStudentReport = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const records = await Attendance.find({ studentId: student._id }).populate('sessionId', 'date sessionName topic startTime endTime status').sort({ createdAt: -1 });
    const submitted = records.filter(r => r.sessionId && r.sessionId.status !== 'draft');
    const present = submitted.filter(r => r.status === 'present').length;
    const total = submitted.length;
    const thresholdSetting = await Setting.findOne({ key: 'attendanceThreshold' });
    const threshold = thresholdSetting ? thresholdSetting.value : 75;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    res.json({ success: true, data: { student, totalClasses: total, presentCount: present, absentCount: total - present, attendancePercentage: percentage, isBelowThreshold: total > 0 && percentage < threshold, threshold, attendance: submitted } });
  } catch (error) { next(error); }
};

const exportReport = async (req, res, next) => {
  try {
    const { type = 'daily', date, month, year } = req.query;
    let csvData = '';
    if (type === 'daily') {
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);
      const sessions = await Session.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'draft' } });
      csvData = 'Session,Topic,Date,Student,Roll Number,Status\n';
      for (const session of sessions) {
        const records = await Attendance.find({ sessionId: session._id }).populate('studentId', 'fullName rollNumber');
        for (const r of records) {
          if (r.studentId) csvData += `"${session.sessionName}","${session.topic}","${new Date(session.date).toLocaleDateString()}","${r.studentId.fullName}","${r.studentId.rollNumber}","${r.status}"\n`;
        }
      }
    } else {
      const m = parseInt(month) || new Date().getMonth() + 1;
      const y = parseInt(year) || new Date().getFullYear();
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);
      const sessions = await Session.find({ date: { $gte: startDate, $lte: endDate }, status: { $ne: 'draft' } });
      const students = await Student.find({ isActive: true }).sort({ rollNumber: 1 });
      csvData = 'Student,Roll Number,Total Classes,Present,Absent,Percentage\n';
      for (const student of students) {
        const records = await Attendance.find({ studentId: student._id, sessionId: { $in: sessions.map(s => s._id) } });
        const present = records.filter(r => r.status === 'present').length;
        const total = records.length;
        const pct = total > 0 ? ((present / total) * 100).toFixed(2) : 'N/A';
        csvData += `"${student.fullName}","${student.rollNumber}",${total},${present},${total - present},${pct}\n`;
      }
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${type}-${Date.now()}.csv`);
    res.send(csvData);
  } catch (error) { next(error); }
};

module.exports = { getDailyReport, getMonthlyReport, getStudentReport, exportReport };
