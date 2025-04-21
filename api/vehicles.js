// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for vehicle routes
const vehicleRoutes = require('./src/routes/vehicleRoutes');

// Mount the specific router directly. Vercel handles the /api/vehicles part based on filename.
app.use('/', vehicleRoutes); 

// Export the app instance for Vercel
module.exports = app;
