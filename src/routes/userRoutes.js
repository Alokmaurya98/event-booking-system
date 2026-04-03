const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.get('/:id/bookings', authenticate, bookingController.getUserBookings);

module.exports = router;
