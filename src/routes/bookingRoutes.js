const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { createBookingValidation } = require('../validations');

router.post('/', authenticate, createBookingValidation, bookingController.createBooking);

module.exports = router;
