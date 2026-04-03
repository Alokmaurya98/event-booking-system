const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [3, 200] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: { isDate: true },
    },
    total_capacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: { min: 1 },
    },
    remaining_tickets: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: 'events',
    timestamps: true,
    hooks: {
      beforeCreate: (event) => {
        // Ensure remaining_tickets equals total_capacity on creation
        if (event.remaining_tickets === undefined || event.remaining_tickets === null) {
          event.remaining_tickets = event.total_capacity;
        }
      },
    },
  }
);

module.exports = Event;
