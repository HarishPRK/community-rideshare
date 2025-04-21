// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for vehicle routes
const vehicleRoutes = require('./src/routes/vehicleRoutes');

// Mount the vehicle routes under the /api/vehicles path
const apiRouter = require('express').Router();
apiRouter.use('/vehicles', vehicleRoutes); // Mount vehicleRoutes under /vehicles within this apiRouter

app.use('/api', apiRouter); // Mount this specific apiRouter under /api

// Export the app instance for Vercel
module.exports = app;
