// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for ride routes
const rideRoutes = require('./src/routes/rideRoutes');

// Mount the ride routes under the /api/rides path
const apiRouter = require('express').Router();
apiRouter.use('/rides', rideRoutes); // Mount rideRoutes under /rides within this apiRouter

app.use('/api', apiRouter); // Mount this specific apiRouter under /api

// Export the app instance for Vercel
module.exports = app;
