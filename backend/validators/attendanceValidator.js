const { body } = require('express-validator');

const markAttendanceValidator = [
  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isMongoId().withMessage('Invalid session ID'),
  body('records')
    .isArray({ min: 1 }).withMessage('Attendance records are required'),
  body('records.*.studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),
  body('records.*.status')
    .notEmpty().withMessage('Status is required')
    .isIn(['present', 'absent']).withMessage('Status must be present or absent'),
];

const correctionValidator = [
  body('attendanceId')
    .notEmpty().withMessage('Attendance ID is required')
    .isMongoId().withMessage('Invalid attendance ID'),
  body('newStatus')
    .notEmpty().withMessage('New status is required')
    .isIn(['present', 'absent']).withMessage('Status must be present or absent'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Correction reason is required')
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters'),
];

module.exports = { markAttendanceValidator, correctionValidator };
