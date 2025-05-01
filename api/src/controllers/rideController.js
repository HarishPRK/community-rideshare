const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { 
  Ride, 
  RideRequest, 
  User, 
  Vehicle, 
  Location,
  Rating
} = require('../models');

/**
 * Get all available rides
 * @route GET /api/rides/available
 */
const getAvailableRides = async (req, res, next) => {
  try {
    const rides = await Ride.findAll({
      where: {
        status: 'ACTIVE',
        departureDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'model', 'color', 'capacity']
        },
        {
          model: Location,
          as: 'pickupLocation'
        },
        {
          model: Location,
          as: 'dropoffLocation'
        }
      ],
      order: [['departureDate', 'ASC'], ['departureTime', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rides requested by the current user
 * @route GET /api/rides/requested
 */
const getRequestedRides = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const rideRequests = await RideRequest.findAll({
      where: {
        passengerId: userId
      },
      include: [
        {
          model: Ride,
          as: 'ride',
          include: [
            {
              model: User,
              as: 'driver',
              attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
            },
            {
              model: Vehicle,
              as: 'vehicle',
              attributes: ['id', 'model', 'color', 'capacity']
            },
            {
              model: Location,
              as: 'pickupLocation'
            },
            {
              model: Location,
              as: 'dropoffLocation'
            }
          ]
        }
      ],
      order: [
        [{ model: Ride, as: 'ride' }, 'departureDate', 'ASC'],
        [{ model: Ride, as: 'ride' }, 'departureTime', 'ASC']
      ]
    });
    
    // Extract rides from ride requests
    const rides = rideRequests.map(request => {
      const ride = request.ride.toJSON();
      ride.requestStatus = request.status;
      ride.requestId = request.id;
      return ride;
    });
    
    res.status(200).json({
      success: true,
      rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rides offered by the current user
 * @route GET /api/rides/offered
 */
const getOfferedRides = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const rides = await Ride.findAll({
      where: {
        driverId: userId
      },
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'model', 'color', 'capacity']
        },
        {
          model: Location,
          as: 'pickupLocation'
        },
        {
          model: Location,
          as: 'dropoffLocation'
        },
        {
          model: RideRequest,
          as: 'requests',
          include: [
            {
              model: User,
              as: 'passenger',
              attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
            }
          ]
        }
      ],
      order: [['departureDate', 'ASC'], ['departureTime', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ride by ID
 * @route GET /api/rides/:id
 */
const getRideById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ride = await Ride.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'model', 'color', 'capacity']
        },
        {
          model: Location,
          as: 'pickupLocation'
        },
        {
          model: Location,
          as: 'dropoffLocation'
        },
        {
          model: RideRequest,
          as: 'requests',
          include: [
            {
              model: User,
              as: 'passenger',
              attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
            }
          ]
        }
      ]
    });
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if current user is the driver or a passenger
    const userId = req.user.id;
    let userRole = null;
    let requestStatus = null;
    let requestId = null;
    
    if (ride.driverId === userId) {
      userRole = 'driver';
    } else {
      const request = await RideRequest.findOne({
        where: {
          rideId: id,
          passengerId: userId
        }
      });
      
      if (request) {
        userRole = 'passenger';
        requestStatus = request.status;
        requestId = request.id;
      }
    }
    
    res.status(200).json({
      success: true,
      ride,
      userRole,
      requestStatus,
      requestId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Created location
 */
const createLocation = async (locationData) => {
  return await Location.create({
    id: uuidv4(),
    address: locationData.address,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    city: locationData.city,
    state: locationData.state,
    zipCode: locationData.zipCode
  });
};

/**
 * Offer a new ride
 * @route POST /api/rides/offer
 */
const offerRide = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      vehicleId,
      vehicle,  // This is the new parameter that might be provided with vehicle details
      pickupLocation,
      dropoffLocation,
      departureDate,
      departureTime,
      price,
      maxPassengers,
      distance,
      duration
    } = req.body;
    
    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !departureDate || 
        !departureTime || !price || !maxPassengers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if user is a driver
    let user = await User.findByPk(userId);
    
    // If user doesn't exist (development mode with mock auth), create one for testing
    if (!user) {
      console.log('Creating test user for development mode');
      user = await User.create({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password: 'password', // Dummy password
        role: 'DRIVER',
        status: 'ACTIVE'
      });
    } else if (user.role !== 'DRIVER') {
      // Automatically upgrade to driver if not already
      user.role = 'DRIVER';
      await user.save();
    }
    
    // Variable to store the vehicle ID to use
    let actualVehicleId = vehicleId;
    
    // If vehicleId is not provided but vehicle details are, create a new vehicle
    if (!vehicleId && vehicle) {
      // Validate vehicle details
      if (!vehicle.model || !vehicle.color || !vehicle.licensePlate) {
        return res.status(400).json({
          success: false,
          message: 'Missing vehicle details (model, color, licensePlate)'
        });
      }
      
      // Create a new vehicle
      const newVehicle = await Vehicle.create({
        id: uuidv4(),
        userId,
        model: vehicle.model,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity || maxPassengers  // Default capacity to maxPassengers if not provided
      });
      
      // Use the new vehicle's ID
      actualVehicleId = newVehicle.id;
      console.log(`Created new vehicle with ID: ${actualVehicleId}`);
    } else if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Either vehicleId or vehicle details must be provided'
      });
    } else {
      // Verify existing vehicle belongs to user
      const existingVehicle = await Vehicle.findOne({
        where: { id: vehicleId, userId }
      });
      
      if (!existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle not found or does not belong to you'
        });
      }
    }
    
    // Create pickup and dropoff locations
    const createdPickupLocation = await createLocation(pickupLocation);
    const createdDropoffLocation = await createLocation(dropoffLocation);
    
    // Create ride
    const ride = await Ride.create({
      id: uuidv4(),
      driverId: userId,
      vehicleId: actualVehicleId,  // Use the calculated vehicle ID (either existing or newly created)
      pickupLocationId: createdPickupLocation.id,
      dropoffLocationId: createdDropoffLocation.id,
      // Explicitly parse the date string as UTC midnight before saving
      departureDate: new Date(Date.UTC(
        parseInt(departureDate.substring(0, 4)), 
        parseInt(departureDate.substring(5, 7)) - 1, // Month is 0-indexed
        parseInt(departureDate.substring(8, 10)),
        0, 0, 0, 0 // Set time to midnight UTC
      )), 
      departureTime,
      price,
      maxPassengers,
      passengers: 0,
      distance: distance || null,
      duration: duration || null,
      status: 'ACTIVE'
    });
    
    // Fetch ride with all related data
    const createdRide = await Ride.findByPk(ride.id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'model', 'color', 'capacity']
        },
        {
          model: Location,
          as: 'pickupLocation'
        },
        {
          model: Location,
          as: 'dropoffLocation'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Ride offered successfully',
      ride: createdRide
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request to join a ride
 * @route POST /api/rides/request
 */
const requestRide = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rideId, passengerCount, note } = req.body;
    
    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: 'Ride ID is required'
      });
    }
    
    // Find ride
    const ride = await Ride.findByPk(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if ride is active
    if (ride.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Ride is not available for requests'
      });
    }
    
    // Check if ride has enough capacity
    const count = passengerCount || 1;
    if (ride.passengers + count > ride.maxPassengers) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available'
      });
    }
    
    // Check if user has already requested this ride
    const existingRequest = await RideRequest.findOne({
      where: { rideId, passengerId: userId }
    });
    
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested this ride'
      });
    }
    
    // Create ride request
    const rideRequest = await RideRequest.create({
      id: uuidv4(),
      rideId,
      passengerId: userId,
      passengerCount: count,
      status: 'PENDING',
      note: note || null
    });
    
    // Fetch the ride request with related data
    const createdRequest = await RideRequest.findByPk(rideRequest.id, {
      include: [
        {
          model: Ride,
          as: 'ride',
          include: [
            {
              model: Location,
              as: 'pickupLocation'
            },
            {
              model: Location,
              as: 'dropoffLocation'
            }
          ]
        },
        {
          model: User,
          as: 'passenger',
          attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      rideRequest: createdRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a ride request
 * @route PUT /api/rides/:id/accept
 */
const acceptRideRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find ride request
    const rideRequest = await RideRequest.findByPk(id, {
      include: [
        {
          model: Ride,
          as: 'ride'
        }
      ]
    });
    
    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }
    
    // Check if user is the driver of the ride
    const ride = rideRequest.ride;
    
    if (ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request'
      });
    }
    
    // Check if request is pending
    if (rideRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${rideRequest.status.toLowerCase()}`
      });
    }
    
    // Update ride request status
    rideRequest.status = 'ACCEPTED';
    await rideRequest.save();
    
    // Update ride passenger count
    ride.passengers += rideRequest.passengerCount;
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: 'Ride request accepted successfully',
      rideRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a ride request
 * @route PUT /api/rides/:id/reject
 */
const rejectRideRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find ride request
    const rideRequest = await RideRequest.findByPk(id, {
      include: [
        {
          model: Ride,
          as: 'ride'
        }
      ]
    });
    
    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }
    
    // Check if user is the driver of the ride
    const ride = rideRequest.ride;
    
    if (ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }
    
    // Check if request is pending
    if (rideRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${rideRequest.status.toLowerCase()}`
      });
    }
    
    // Update ride request status
    rideRequest.status = 'REJECTED';
    await rideRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Ride request rejected successfully',
      rideRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a ride
 * @route PUT /api/rides/:id/start
 */
const startRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find ride
    const ride = await Ride.findByPk(id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the driver
    if (ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start this ride'
      });
    }
    
    // Check if ride can be started
    if (ride.status !== 'ACTIVE' && ride.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be started because it is ${ride.status.toLowerCase()}`
      });
    }
    
    // Update ride status
    ride.status = 'IN_PROGRESS';
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: 'Ride started successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a ride
 * @route PUT /api/rides/:id/complete
 */
const completeRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find ride
    const ride = await Ride.findByPk(id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the driver
    if (ride.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this ride'
      });
    }
    
    // Check if ride is in progress
    if (ride.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be completed because it is ${ride.status.toLowerCase()}`
      });
    }
    
    // Update ride status
    ride.status = 'COMPLETED';
    await ride.save();
    console.log(`[completeRide] Ride ${id} status updated to COMPLETED.`);

    // Also update the status of all accepted ride requests for this ride
    console.log(`[completeRide] Attempting to update RideRequests for rideId: ${id} from ACCEPTED to COMPLETED.`);
    const [updateCount] = await RideRequest.update( // Destructure result to get count
      { status: 'COMPLETED' },
      {
        where: {
          rideId: id,
          status: 'ACCEPTED' // Only update requests that were accepted
        }
      }
    );
    console.log(`[completeRide] Updated ${updateCount} RideRequest records.`); // Log the number of updated records
    
    // Fetch the updated ride again to return the latest state including associations if needed
    const updatedRide = await Ride.findByPk(id, { include: [ /* include associations if needed by frontend */ ] });

    res.status(200).json({
      success: true,
      message: 'Ride completed successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a ride
 * @route PUT /api/rides/:id/cancel
 */
const cancelRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;
    
    // Find ride
    const ride = await Ride.findByPk(id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the driver or a passenger
    let isDriver = false;
    let isPassenger = false;
    
    if (ride.driverId === userId) {
      isDriver = true;
    } else {
      const request = await RideRequest.findOne({
        where: {
          rideId: id,
          passengerId: userId,
          status: 'ACCEPTED'
        }
      });
      
      if (request) {
        isPassenger = true;
      }
    }
    
    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this ride'
      });
    }
    
    // Check if ride can be canceled
    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Ride cannot be cancelled because it is already ${ride.status.toLowerCase()}`
      });
    }
    
    if (isDriver) {
      // Driver is cancelling the entire ride
      ride.status = 'CANCELLED';
      await ride.save();
      
      // Update all accepted ride requests to cancelled
      await RideRequest.update(
        { status: 'CANCELLED' },
        {
          where: {
            rideId: id,
            status: 'ACCEPTED'
          }
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Ride cancelled successfully',
        ride
      });
    } else {
      // Passenger is cancelling their request
      const request = await RideRequest.findOne({
        where: {
          rideId: id,
          passengerId: userId,
          status: 'ACCEPTED'
        }
      });
      
      request.status = 'CANCELLED';
      await request.save();
      
      // Update ride passenger count
      ride.passengers -= request.passengerCount;
      await ride.save();
      
      res.status(200).json({
        success: true,
        message: 'Your ride request has been cancelled',
        rideRequest: request
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Rate a ride
 * @route POST /api/rides/:id/rate
 */
const rateRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment, toUserId } = req.body;
    
    if (!rating || !toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Rating value and recipient user ID are required'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Find ride
    const ride = await Ride.findByPk(id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if ride is completed
    if (ride.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }
    
    // Check if user was part of the ride
    let isDriver = false;
    let isPassenger = false;
    
    if (ride.driverId === userId) {
      isDriver = true;
    } else {
      const request = await RideRequest.findOne({
        where: {
          rideId: id,
          passengerId: userId,
          status: 'ACCEPTED'
        }
      });
      
      if (request) {
        isPassenger = true;
      }
    }
    
    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to rate this ride'
      });
    }
    
    // Determine rating type
    let ratingType = null;
    
    if (isDriver) {
      ratingType = 'DRIVER_TO_PASSENGER';
      
      // Verify toUserId is a passenger
      const passengerRequest = await RideRequest.findOne({
        where: {
          rideId: id,
          passengerId: toUserId,
          status: 'ACCEPTED'
        }
      });
      
      if (!passengerRequest) {
        return res.status(400).json({
          success: false,
          message: 'User is not a passenger of this ride'
        });
      }
    } else {
      ratingType = 'PASSENGER_TO_DRIVER';
      
      // Verify toUserId is the driver
      if (toUserId !== ride.driverId) {
        return res.status(400).json({
          success: false,
          message: 'User is not the driver of this ride'
        });
      }
    }
    
    // Check if user has already rated this person for this ride
    const existingRating = await Rating.findOne({
      where: {
        rideId: id,
        fromUserId: userId,
        toUserId
      }
    });
    
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this user for this ride'
      });
    }
    
    // Create rating
    const newRating = await Rating.create({
      id: uuidv4(),
      rideId: id,
      fromUserId: userId,
      toUserId,
      value: rating,
      comment: comment || null,
      type: ratingType
    });
    
    // Update user's overall rating
    const ratedUser = await User.findByPk(toUserId);
    
    // Calculate new average rating
    const newRatingCount = ratedUser.ratingCount + 1;
    const newRatingValue = ((ratedUser.rating * ratedUser.ratingCount) + rating) / newRatingCount;
    
    // Update user
    ratedUser.rating = newRatingValue;
    ratedUser.ratingCount = newRatingCount;
    await ratedUser.save();
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search for rides
 * @route POST /api/rides/search
 */
const searchRides = async (req, res, next) => {
  try {
    // Read the single 'location' parameter sent by the frontend
    const {
      location, // Use this instead of separate pickup/dropoff
      departureDate,
      passengers,
      // Include radius and maxPrice if you implement those filters later
      // radius, 
      // maxPrice 
    } = req.body;
    
    // Build search criteria
    const where = {
      status: 'ACTIVE',
    };
    
    // Add departure date criteria if provided
    if (departureDate) {
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      
      // Create date range for the specific day in UTC to avoid timezone issues
      // Start of the day (e.g., 2025-04-17T00:00:00.000Z)
      const startDate = new Date(Date.UTC(
        parseInt(departureDate.substring(0, 4)), 
        parseInt(departureDate.substring(5, 7)) - 1, // Month is 0-indexed
        parseInt(departureDate.substring(8, 10)),
        0, 0, 0, 0 // Set time to midnight UTC
      ));
      
      // Start of the next day (e.g., 2025-04-18T00:00:00.000Z)
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);

      console.log(`Searching for rides between UTC ${startDate.toISOString()} and ${endDate.toISOString()}`);

      // Query for dates within the UTC day range
      where.departureDate = {
        [Op.gte]: startDate, // Greater than or equal to the start of the UTC day
        [Op.lt]: endDate     // Less than the start of the next UTC day
      };
    } else {
      // Default to rides from the beginning of today onwards (UTC)
      const todayStartUTC = new Date();
      todayStartUTC.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
      
      console.log(`Searching for rides from ${todayStartUTC.toISOString()} onwards (UTC)`);
      where.departureDate = {
        [Op.gte]: todayStartUTC 
      };
    }
    
    // Create query
    const query = {
      where,
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'rating', 'ratingCount', 'profilePicture']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'model', 'color', 'capacity']
        },
        {
          model: Location,
          as: 'pickupLocation'
        },
        {
          model: Location,
          as: 'dropoffLocation'
        }
      ],
      order: [['departureDate', 'ASC'], ['departureTime', 'ASC']]
    };
    
    // Find rides
    let rides = await Ride.findAll(query);
    
    // Filter by the single 'location' parameter if provided
    if (location) {
      const locationLower = location.toLowerCase();
      console.log(`\nFiltering rides for location: "${locationLower}"`); // Log search term
      rides = rides.filter(ride => {
        // Add checks to ensure location objects exist before accessing properties
        const pickup = ride.pickupLocation || {}; 
        const dropoff = ride.dropoffLocation || {};
        
        console.log(`-- Checking Ride ID: ${ride.id}`);
        console.log(`   Pickup Address: "${pickup.address}", City: "${pickup.city}", State: "${pickup.state}"`);
        console.log(`   Dropoff Address: "${dropoff.address}", City: "${dropoff.city}", State: "${dropoff.state}"`);

        // Check if the search location matches part of the pickup OR dropoff address/city/state
        const matchesPickup = (pickup.address && pickup.address.toLowerCase().includes(locationLower)) ||
                             (pickup.city && pickup.city.toLowerCase().includes(locationLower)) ||
                             (pickup.state && pickup.state.toLowerCase().includes(locationLower));
                             
        const matchesDropoff = dropoff.address.toLowerCase().includes(locationLower) ||
                              (dropoff.city && dropoff.city.toLowerCase().includes(locationLower)) ||
                              (dropoff.state && dropoff.state.toLowerCase().includes(locationLower));
        
        const shouldKeep = matchesPickup || matchesDropoff;
        console.log(`   Matches Pickup: ${matchesPickup}, Matches Dropoff: ${matchesDropoff}, Keep: ${shouldKeep}`);
        return shouldKeep;
      });
      console.log(`Finished filtering. ${rides.length} rides remaining.`);
    }
    
    // Filter by passenger count if provided
    if (passengers) {
      rides = rides.filter(ride => {
        return (ride.maxPassengers - ride.passengers) >= passengers;
      });
    }
    
    res.status(200).json({
      success: true,
      rides
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableRides,
  getRequestedRides,
  getOfferedRides,
  getRideById,
  offerRide,
  requestRide,
  acceptRideRequest,
  rejectRideRequest,
  startRide,
  completeRide,
  cancelRide,
  rateRide,
  searchRides
};
