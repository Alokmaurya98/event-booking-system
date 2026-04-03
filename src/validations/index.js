const { body, param } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),
  body('description').optional().trim(),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date')
    .toDate(),
  body('total_capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
    .toInt(),
];

const createBookingValidation = [
  body('event_id')
    .notEmpty().withMessage('event_id is required')
    .isInt({ min: 1 }).withMessage('event_id must be a positive integer')
    .toInt(),
  body('tickets_count')
    .optional()
    .isInt({ min: 1 }).withMessage('tickets_count must be a positive integer')
    .toInt(),
];

const attendanceValidation = [
  param('id').isInt({ min: 1 }).withMessage('Event ID must be a positive integer').toInt(),
  body('booking_code')
    .trim()
    .notEmpty().withMessage('booking_code is required')
    .isUUID(4).withMessage('booking_code must be a valid UUID'),
];

module.exports = {
  registerValidation,
  loginValidation,
  createEventValidation,
  createBookingValidation,
  attendanceValidation,
};
