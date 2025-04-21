// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for ride routes
const rideRoutes = require('./src/routes/rideRoutes');

// Mount the specific router directly. Vercel handles the /api/rides part based on filename.
app.use('/', rideRoutes); 

// Export the app instance for Vercel
module.exports = app;
