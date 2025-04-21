const { DataTypes, UUIDV4 } = require('sequelize'); // Import UUIDV4
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID, // Use UUID type
    defaultValue: UUIDV4, // Set default value to generate UUIDs
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID, // Match UUID type if User ID is UUID
    allowNull: false,
    references: {
      model: 'users', // Ensure this matches the User table name
      key: 'id'
    }
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
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
  tableName: 'vehicles',
  timestamps: true
});

module.exports = Vehicle;
