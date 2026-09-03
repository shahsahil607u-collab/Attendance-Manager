const { body } = require('express-validator');

const createSessionValidator = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Please enter a valid date'),
  body('startTime')
    .trim()
    .notEmpty().withMessage('Start time is required'),
  body('endTime')
    .trim()
    .notEmpty().withMessage('End time is required'),
  body('sessionName')
    .trim()
    .notEmpty().withMessage('Session name is required')
    .isLength({ max: 200 }).withMessage('Session name cannot exceed 200 characters'),
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ max: 200 }).withMessage('Topic cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
];

module.exports = { createSessionValidator };
