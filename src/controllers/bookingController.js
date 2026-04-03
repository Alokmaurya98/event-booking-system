const { validationResult } = require('express-validator');
const bookingService = require('../services/bookingService');

const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { event_id, tickets_count } = req.body;

    const user_id = req.user.id; 

    const booking = await bookingService.createBooking({ user_id, event_id, tickets_count });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: {
        booking_id: booking.id,
        booking_code: booking.booking_code,
        tickets_count: booking.tickets_count,
        status: booking.status,
        event: booking.event,
        user: booking.user,
        booking_date: booking.booking_date,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, bookings } = await bookingService.getUserBookings(id);

    return res.status(200).json({
      success: true,
      data: {
        user,
        total_bookings: bookings.length,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const recordAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const event_id = parseInt(req.params.id);
    const { booking_code } = req.body;

    const result = await bookingService.recordAttendance({ event_id, booking_code });

    const message = result.already_checked_in
      ? 'Attendee already checked in'
      : 'Attendance recorded successfully';

    return res.status(200).json({
      success: true,
      message,
      data: {
        already_checked_in: result.already_checked_in,
        entry_time: result.entry_time,
        tickets_booked: result.tickets_booked,
        user: result.booking.user,
        event: result.booking.event,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getUserBookings, recordAttendance };
