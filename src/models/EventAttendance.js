const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventAttendance = sequelize.define(
  'EventAttendance',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'events', key: 'id' },
    },
    booking_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'bookings', key: 'id' },
    },
    entry_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'event_attendance',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['event_id'] },
      { fields: ['booking_id'], unique: true },
    ],
  }
);

module.exports = EventAttendance;
