// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for user routes
const userRoutes = require('./src/routes/userRoutes');

// Mount the user routes under the /api/users path
const apiRouter = require('express').Router();
apiRouter.use('/users', userRoutes); // Mount userRoutes under /users within this apiRouter

app.use('/api', apiRouter); // Mount this specific apiRouter under /api

// Export the app instance for Vercel
module.exports = app;
