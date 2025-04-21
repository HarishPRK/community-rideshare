const User = require('./User');
const Vehicle = require('./Vehicle');
const Location = require('./Location');
const Ride = require('./Ride');
const RideRequest = require('./RideRequest');
const Rating = require('./Rating');
const { sequelize } = require('../config/database');

// Define relationships between models

// User-Vehicle relationship (one-to-many)
User.hasMany(Vehicle, {
  foreignKey: 'userId',
  as: 'vehicles',
  onDelete: 'CASCADE'
});
Vehicle.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner'
});

// User-Ride relationship as driver (one-to-many)
User.hasMany(Ride, {
  foreignKey: 'driverId',
  as: 'offeredRides',
  onDelete: 'CASCADE'
});
Ride.belongsTo(User, {
  foreignKey: 'driverId',
  as: 'driver'
});

// Vehicle-Ride relationship (one-to-many)
Vehicle.hasMany(Ride, {
  foreignKey: 'vehicleId',
  as: 'rides',
  onDelete: 'CASCADE'
});
Ride.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle'
});

// Location-Ride relationships
Location.hasMany(Ride, {
  foreignKey: 'pickupLocationId',
  as: 'ridesAsPickup'
});
Ride.belongsTo(Location, {
  foreignKey: 'pickupLocationId',
  as: 'pickupLocation'
});

Location.hasMany(Ride, {
  foreignKey: 'dropoffLocationId',
  as: 'ridesAsDropoff'
});
Ride.belongsTo(Location, {
  foreignKey: 'dropoffLocationId',
  as: 'dropoffLocation'
});

// Ride-RideRequest relationship (one-to-many)
Ride.hasMany(RideRequest, {
  foreignKey: 'rideId',
  as: 'requests',
  onDelete: 'CASCADE'
});
RideRequest.belongsTo(Ride, {
  foreignKey: 'rideId',
  as: 'ride'
});

// User-RideRequest relationship as passenger (one-to-many)
User.hasMany(RideRequest, {
  foreignKey: 'passengerId',
  as: 'requestedRides',
  onDelete: 'CASCADE'
});
RideRequest.belongsTo(User, {
  foreignKey: 'passengerId',
  as: 'passenger'
});

// Ride-Rating relationship (one-to-many)
Ride.hasMany(Rating, {
  foreignKey: 'rideId',
  as: 'ratings',
  onDelete: 'CASCADE'
});
Rating.belongsTo(Ride, {
  foreignKey: 'rideId',
  as: 'ride'
});

// User-Rating relationships
User.hasMany(Rating, {
  foreignKey: 'fromUserId',
  as: 'givenRatings'
});
Rating.belongsTo(User, {
  foreignKey: 'fromUserId',
  as: 'rater'
});

User.hasMany(Rating, {
  foreignKey: 'toUserId',
  as: 'receivedRatings'
});
Rating.belongsTo(User, {
  foreignKey: 'toUserId',
  as: 'rated'
});

// Function to sync all models with the database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    return false;
  }
};

module.exports = {
  User,
  Vehicle,
  Location,
  Ride,
  RideRequest,
  Rating,
  sequelize,
  syncDatabase
};
