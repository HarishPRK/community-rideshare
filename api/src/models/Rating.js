const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  rideId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'rides',
      key: 'id'
    }
  },
  fromUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('DRIVER_TO_PASSENGER', 'PASSENGER_TO_DRIVER'),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ratings',
  timestamps: true
});

module.exports = Rating;
