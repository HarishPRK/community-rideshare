const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RideRequest = sequelize.define('RideRequest', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  rideId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rides',
      key: 'id'
    }
  },
  passengerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  passengerCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  status: {
    // Added 'COMPLETED' to the allowed ENUM values
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'), 
    defaultValue: 'PENDING',
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'ride_requests',
  timestamps: true
});

module.exports = RideRequest;
