const { Op } = require('sequelize');
const { Event } = require('../models');

const getAllUpcomingEvents = async () => {
  return Event.findAll({
    where: {
      date: { [Op.gte]: new Date() },
    },
    order: [['date', 'ASC']],
    attributes: [
      'id', 'title', 'description', 'date',
      'total_capacity', 'remaining_tickets', 'createdAt',
    ],
  });
};

const createEvent = async ({ title, description, date, total_capacity }) => {
  const eventDate = new Date(date);
  if (eventDate <= new Date()) {
    const error = new Error('Event date must be in the future');
    error.statusCode = 400;
    throw error;
  }

  const event = await Event.create({
    title,
    description,
    date: eventDate,
    total_capacity,
    remaining_tickets: total_capacity,
  });

  return event;
};

const getEventById = async (id) => {
  const event = await Event.findByPk(id);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

module.exports = { getAllUpcomingEvents, createEvent, getEventById };
