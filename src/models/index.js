const User = require('./User');
const Event = require('./Event');
const Booking = require('./Booking');
const EventAttendance = require('./EventAttendance');

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(Booking, { foreignKey: 'event_id', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventAttendance, { foreignKey: 'user_id', as: 'attendance' });
EventAttendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(EventAttendance, { foreignKey: 'event_id', as: 'attendance' });
EventAttendance.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Booking.hasOne(EventAttendance, { foreignKey: 'booking_id', as: 'attendance' });
EventAttendance.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = { User, Event, Booking, EventAttendance };
