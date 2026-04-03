const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');
const { Booking, Event, User, EventAttendance } = require('../models');

/**
 * Book tickets for a user.
 *
 * Race condition is handled by:
 * 1. Wrapping the entire operation in a MySQL TRANSACTION
 * 2. Using SELECT ... FOR UPDATE (lock: true) to lock the event row
 *    so concurrent requests cannot read a stale remaining_tickets value
 *    before this transaction commits.
 */
const createBooking = async ({ user_id, event_id, tickets_count = 1 }) => {
  const transaction = await sequelize.transaction();

  try {
    // Lock the event row for this transaction — prevents race conditions
    const event = await Event.findOne({
      where: { id: event_id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!event) {
      await transaction.rollback();
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (new Date(event.date) < new Date()) {
      await transaction.rollback();
      const error = new Error('Cannot book tickets for a past event');
      error.statusCode = 400;
      throw error;
    }

    if (event.remaining_tickets < tickets_count) {
      await transaction.rollback();
      const error = new Error(
        `Not enough tickets available. Remaining: ${event.remaining_tickets}`
      );
      error.statusCode = 409;
      throw error;
    }

    // Decrement remaining tickets
    await event.decrement('remaining_tickets', { by: tickets_count, transaction });

    const booking_code = uuidv4();

    const booking = await Booking.create(
      {
        user_id,
        event_id,
        booking_date: new Date(),
        booking_code,
        tickets_count,
        status: 'confirmed',
      },
      { transaction }
    );

    await transaction.commit();

    // Return booking with related data
    return Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'remaining_tickets'] },
      ],
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

const getUserBookings = async (user_id) => {
  const user = await User.findByPk(user_id, {
    attributes: ['id', 'name', 'email'],
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const bookings = await Booking.findAll({
    where: { user_id },
    include: [
      {
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'description', 'date', 'total_capacity', 'remaining_tickets'],
      },
    ],
    order: [['booking_date', 'DESC']],
  });

  return { user, bookings };
};

const recordAttendance = async ({ event_id, booking_code }) => {
  const booking = await Booking.findOne({
    where: { booking_code, event_id },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Event, as: 'event', attributes: ['id', 'title', 'date'] },
    ],
  });

  if (!booking) {
    const error = new Error('Invalid booking code for this event');
    error.statusCode = 404;
    throw error;
  }

  if (booking.status === 'cancelled') {
    const error = new Error('This booking has been cancelled');
    error.statusCode = 400;
    throw error;
  }

  // Check if already checked in
  const existingAttendance = await EventAttendance.findOne({
    where: { booking_id: booking.id },
  });

  if (existingAttendance) {
    return {
      already_checked_in: true,
      entry_time: existingAttendance.entry_time,
      tickets_booked: booking.tickets_count,
      booking,
    };
  }

  const attendance = await EventAttendance.create({
    user_id: booking.user_id,
    event_id: booking.event_id,
    booking_id: booking.id,
    entry_time: new Date(),
  });

  return {
    already_checked_in: false,
    entry_time: attendance.entry_time,
    tickets_booked: booking.tickets_count,
    booking,
  };
};

module.exports = { createBooking, getUserBookings, recordAttendance };
