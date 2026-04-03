const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define(
  'Booking',
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
    booking_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    booking_code: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
      comment: 'Unique UUID code provided to user after booking',
    },
    tickets_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed',
    },
  },
  {
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['event_id'] },
      { fields: ['booking_code'], unique: true },
    ],
  }
);

module.exports = Booking;
