const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { createAuditLog } = require('../services/auditService');
const { sendAbsentNotifications, sendHodReport } = require('../services/notificationService');

/**
 * GET /api/sessions
 */
const getSessions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [sessions, total] = await Promise.all([
      Session.find(query)
        .populate('createdBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Session.countDocuments(query),
    ]);

    // Attach attendance counts to each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const [presentCount, absentCount] = await Promise.all([
          Attendance.countDocuments({ sessionId: session._id, status: 'present' }),
          Attendance.countDocuments({ sessionId: session._id, status: 'absent' }),
        ]);
        return {
          ...session,
          presentCount,
          absentCount,
          totalStudents: presentCount + absentCount,
        };
      })
    );

    res.json({
      success: true,
      data: {
        sessions: sessionsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sessions/:id
 */
const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.',
      });
    }

    // Get attendance records for this session
    const attendance = await Attendance.find({ sessionId: session._id })
      .populate('studentId', 'fullName rollNumber email')
      .populate('markedBy', 'name')
      .sort({ 'studentId.rollNumber': 1 });

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    res.json({
      success: true,
      data: {
        session,
        attendance,
        summary: {
          totalStudents: attendance.length,
          presentCount,
          absentCount,
          attendancePercentage: attendance.length > 0
            ? ((presentCount / attendance.length) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const { date, startTime, endTime, sessionName, topic, description } = req.body;

    const session = await Session.create({
      date,
      startTime,
      endTime,
      sessionName,
      topic,
      description,
      createdBy: req.user._id,
    });

    await createAuditLog({
      action: 'SESSION_CREATED',
      performedBy: req.user._id,
      targetType: 'Session',
      targetId: session._id,
      description: `Created session "${sessionName}" for ${new Date(date).toLocaleDateString()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sessions/:id
 */
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.',
      });
    }

    if (session.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft sessions can be modified.',
      });
    }

    const allowedFields = ['date', 'startTime', 'endTime', 'sessionName', 'topic', 'description'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();

    res.json({
      success: true,
      message: 'Session updated successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sessions/:id/submit
 * Submit attendance for a session. Locks the session.
 * Triggers email notifications (non-blocking).
 */
const submitSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.',
      });
    }

    if (session.status === 'submitted' || session.status === 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this session has already been submitted.',
      });
    }

    // Check that attendance records exist
    const attendanceCount = await Attendance.countDocuments({ sessionId: session._id });
    if (attendanceCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No attendance records found. Please mark attendance before submitting.',
      });
    }

    // Lock the session
    session.status = 'submitted';
    session.submittedAt = new Date();
    await session.save();

    // Get attendance data for notifications
    const attendanceRecords = await Attendance.find({ sessionId: session._id })
      .populate('studentId', 'fullName rollNumber email');

    const absentRecords = attendanceRecords.filter(a => a.status === 'absent');
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = absentRecords.length;
    const totalStudents = attendanceRecords.length;
    const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    // Audit log
    await createAuditLog({
      action: 'ATTENDANCE_SUBMITTED',
      performedBy: req.user._id,
      targetType: 'Session',
      targetId: session._id,
      description: `Submitted attendance for "${session.sessionName}": ${presentCount} present, ${absentCount} absent`,
      metadata: { presentCount, absentCount, totalStudents, attendancePercentage },
    });

    // Send notifications in background (non-blocking)
    // Absent student emails
    if (absentRecords.length > 0) {
      sendAbsentNotifications({
        session,
        absentRecords,
        performedBy: req.user._id,
      }).catch(err => console.error('Absent notification error:', err.message));
    }

    // HOD report
    const absentStudents = absentRecords
      .filter(r => r.studentId)
      .map(r => ({
        fullName: r.studentId.fullName,
        rollNumber: r.studentId.rollNumber,
      }));

    sendHodReport({
      session,
      attendanceData: {
        totalStudents,
        presentCount,
        absentCount,
        attendancePercentage,
        absentStudents,
      },
      performedBy: req.user._id,
    }).catch(err => console.error('HOD report error:', err.message));

    res.json({
      success: true,
      message: 'Attendance submitted successfully. Notifications are being sent.',
      data: {
        session,
        summary: {
          totalStudents,
          presentCount,
          absentCount,
          attendancePercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSessions, getSession, createSession, updateSession, submitSession };
