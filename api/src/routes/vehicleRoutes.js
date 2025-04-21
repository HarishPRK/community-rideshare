const express = require('express');
const { body, param } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

/**
 * Get all vehicles for the current user
 * @route GET /api/vehicles
 */
router.get('/', vehicleController.getUserVehicles);

/**
 * Get vehicle by ID
 * @route GET /api/vehicles/:id
 */
router.get(
  '/:id',
  [
    param('id').isString().withMessage('Invalid vehicle ID')
  ],
  vehicleController.getVehicleById
);

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
router.post(
  '/',
  [
    body('model').trim().not().isEmpty().withMessage('Model is required'),
    body('color').trim().not().isEmpty().withMessage('Color is required'),
    body('licensePlate').trim().not().isEmpty().withMessage('License plate is required'),
    body('capacity').optional().isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10')
  ],
  vehicleController.createVehicle
);

/**
 * Update a vehicle
 * @route PUT /api/vehicles/:id
 */
router.put(
  '/:id',
  [
    param('id').isString().withMessage('Invalid vehicle ID'),
    body('model').optional().trim().not().isEmpty().withMessage('Model cannot be empty'),
    body('color').optional().trim().not().isEmpty().withMessage('Color cannot be empty'),
    body('licensePlate').optional().trim().not().isEmpty().withMessage('License plate cannot be empty'),
    body('capacity').optional().isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
  ],
  vehicleController.updateVehicle
);

/**
 * Delete a vehicle
 * @route DELETE /api/vehicles/:id
 */
router.delete(
  '/:id',
  [
    param('id').isString().withMessage('Invalid vehicle ID')
  ],
  vehicleController.deleteVehicle
);

module.exports = router;
