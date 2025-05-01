const { v4: uuidv4 } = require('uuid');
const { Vehicle } = require('../models');

/**
 * Get all vehicles for the current user
 * @route GET /api/vehicles
 */
const getUserVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const vehicles = await Vehicle.findAll({
      where: { userId }
    });
    
    res.status(200).json({
      success: true,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vehicle by ID
 * @route GET /api/vehicles/:id
 */
const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const vehicle = await Vehicle.findOne({
      where: { id, userId }
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or does not belong to you'
      });
    }
    
    res.status(200).json({
      success: true,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
const createVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { model, color, licensePlate, capacity } = req.body;
    
    if (!model || !color || !licensePlate) {
      return res.status(400).json({
        success: false,
        message: 'Model, color, and license plate are required'
      });
    }
    
    const vehicle = await Vehicle.create({
      id: uuidv4(),
      userId,
      model,
      color,
      licensePlate,
      capacity: capacity || 4,
      status: 'ACTIVE'
    });
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a vehicle
 * @route PUT /api/vehicles/:id
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { model, color, licensePlate, capacity, status } = req.body;
    
    const vehicle = await Vehicle.findOne({
      where: { id, userId }
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or does not belong to you'
      });
    }
    
    // Update vehicle fields
    if (model) vehicle.model = model;
    if (color) vehicle.color = color;
    if (licensePlate) vehicle.licensePlate = licensePlate;
    if (capacity) vehicle.capacity = capacity;
    if (status) vehicle.status = status;
    
    await vehicle.save();
    
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle
 * @route DELETE /api/vehicles/:id
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const vehicle = await Vehicle.findOne({
      where: { id, userId }
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or does not belong to you'
      });
    }
    
    await vehicle.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
