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

const updateSessionValidator = [
  body('date')
    .optional()
    .isISO8601().withMessage('Please enter a valid date'),
  body('startTime')
    .optional()
    .trim()
    .notEmpty().withMessage('Start time cannot be empty')
    .matches(/^\d{2}:\d{2}$/).withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .optional()
    .trim()
    .notEmpty().withMessage('End time cannot be empty')
    .matches(/^\d{2}:\d{2}$/).withMessage('End time must be in HH:MM format'),
  body('sessionName')
    .optional()
    .trim()
    .notEmpty().withMessage('Session name cannot be empty')
    .isLength({ max: 200 }).withMessage('Session name cannot exceed 200 characters'),
  body('topic')
    .optional()
    .trim()
    .notEmpty().withMessage('Topic cannot be empty')
    .isLength({ max: 200 }).withMessage('Topic cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
];

module.exports = { createSessionValidator, updateSessionValidator };
