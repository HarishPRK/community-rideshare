const express = require('express');
const { body, param } = require('express-validator');
const rideController = require('../controllers/rideController');
const { authenticate, authorize } = require('../middleware/auth');
const simplifiedAuth = require('../middleware/simplifiedAuth');

const router = express.Router();

// Use simplified auth for development (bypasses JWT verification) - COMMENTED OUT
// In production, use: router.use(authenticate); 
// router.use(simplifiedAuth); 

// Use the proper authentication middleware
router.use(authenticate); 

/**
 * Get all available rides
 * @route GET /api/rides/available
 */
router.get('/available', rideController.getAvailableRides);

/**
 * Get rides requested by the current user
 * @route GET /api/rides/requested
 */
router.get('/requested', rideController.getRequestedRides);

/**
 * Get rides offered by the current user
 * @route GET /api/rides/offered
 */
router.get('/offered', rideController.getOfferedRides);

/**
 * Search for rides
 * @route POST /api/rides/search
 */
router.post(
  '/search',
  [
    body('pickupLocation').optional(),
    body('dropoffLocation').optional(),
    body('departureDate').optional().isDate().withMessage('Invalid date format'),
    body('passengers').optional().isInt({ min: 1, max: 10 }).withMessage('Passengers must be between 1 and 10')
  ],
  rideController.searchRides
);

/**
 * Offer a new ride
 * @route POST /api/rides/offer
 */
router.post(
  '/offer',
  [
    // Allow either vehicleId or vehicle object with details
    body('vehicleId').optional().isString().withMessage('If provided, Vehicle ID must be a string'),
    body('vehicle').optional().isObject().withMessage('If provided, vehicle must be an object'),
    body('vehicle.model').optional().isString().withMessage('Vehicle model must be a string'),
    body('vehicle.color').optional().isString().withMessage('Vehicle color must be a string'),
    body('vehicle.licensePlate').optional().isString().withMessage('License plate must be a string'),
    
    // Location validation
    body('pickupLocation').isObject().withMessage('Pickup location is required'),
    body('pickupLocation.address').isString().withMessage('Pickup address is required'),
    body('pickupLocation.latitude').isFloat().withMessage('Valid pickup latitude is required'),
    body('pickupLocation.longitude').isFloat().withMessage('Valid pickup longitude is required'),
    body('dropoffLocation').isObject().withMessage('Dropoff location is required'),
    body('dropoffLocation.address').isString().withMessage('Dropoff address is required'),
    body('dropoffLocation.latitude').isFloat().withMessage('Valid dropoff latitude is required'),
    body('dropoffLocation.longitude').isFloat().withMessage('Valid dropoff longitude is required'),
    
    // Other ride details
    body('departureDate').isString().withMessage('Valid departure date is required'),
    body('departureTime').isString().withMessage('Departure time is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('maxPassengers').isInt({ min: 1, max: 10 }).withMessage('Max passengers must be between 1 and 10')
  ],
  rideController.offerRide
);

/**
 * Request to join a ride
 * @route POST /api/rides/request
 */
router.post(
  '/request',
  [
    body('rideId').isString().withMessage('Ride ID is required'),
    body('passengerCount').optional().isInt({ min: 1, max: 10 }).withMessage('Passenger count must be between 1 and 10'),
    body('note').optional().isString()
  ],
  rideController.requestRide
);

/**
 * Get ride by ID
 * @route GET /api/rides/:id
 */
router.get(
  '/:id',
  [
    param('id').isString().withMessage('Invalid ride ID')
  ],
  rideController.getRideById
);

/**
 * Accept a ride request
 * @route PUT /api/rides/:id/accept
 */
router.put(
  '/:id/accept',
  [
    param('id').isString().withMessage('Invalid request ID')
  ],
  rideController.acceptRideRequest
);

/**
 * Reject a ride request
 * @route PUT /api/rides/:id/reject
 */
router.put(
  '/:id/reject',
  [
    param('id').isString().withMessage('Invalid request ID')
  ],
  rideController.rejectRideRequest
);

/**
 * Start a ride
 * @route PUT /api/rides/:id/start
 */
router.put(
  '/:id/start',
  [
    param('id').isString().withMessage('Invalid ride ID')
  ],
  rideController.startRide
);

/**
 * Complete a ride
 * @route PUT /api/rides/:id/complete
 */
router.put(
  '/:id/complete',
  [
    param('id').isString().withMessage('Invalid ride ID')
  ],
  rideController.completeRide
);

/**
 * Cancel a ride
 * @route PUT /api/rides/:id/cancel
 */
router.put(
  '/:id/cancel',
  [
    param('id').isString().withMessage('Invalid ride ID'),
    body('reason').optional().isString()
  ],
  rideController.cancelRide
);

/**
 * Rate a ride
 * @route POST /api/rides/:id/rate
 */
router.post(
  '/:id/rate',
  [
    param('id').isString().withMessage('Invalid ride ID'),
    body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
    body('toUserId').isString().withMessage('Recipient user ID is required')
  ],
  rideController.rateRide
);

module.exports = router;
