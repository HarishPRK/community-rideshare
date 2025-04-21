const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ride = sequelize.define('Ride', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  pickupLocationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  dropoffLocationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  departureDate: {
    // Changed from DATEONLY to DATE to store full timestamp
    type: DataTypes.DATE, 
    allowNull: false
  },
  departureTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  maxPassengers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  distance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'PENDING', 'REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'ACTIVE',
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
  tableName: 'rides',
  timestamps: true
});

module.exports = Ride;
