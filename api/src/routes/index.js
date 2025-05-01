const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const rideRoutes = require('./rideRoutes');

const router = express.Router();

// API Health Check
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Community Rideshare API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rides', rideRoutes);

module.exports = router;
