const { validationResult } = require('express-validator');
const eventService = require('../services/eventService');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllUpcomingEvents();
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { title, description, date, total_capacity } = req.body;
    const event = await eventService.createEvent({ title, description, date, total_capacity });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllEvents, createEvent };
