const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { createEventValidation, attendanceValidation } = require('../validations');

router.get('/', eventController.getAllEvents);
router.post('/', authenticate, createEventValidation, eventController.createEvent);
router.post('/:id/attendance', authenticate, attendanceValidation, bookingController.recordAttendance);

module.exports = router;
