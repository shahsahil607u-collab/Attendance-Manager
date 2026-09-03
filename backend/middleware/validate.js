const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Returns 400 with validation errors if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

module.exports = validate;
