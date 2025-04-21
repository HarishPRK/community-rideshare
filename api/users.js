// Import the configured Express app
const app = require('./src/server'); 
// Import the specific router for user routes
const userRoutes = require('./src/routes/userRoutes');

// Mount the specific router directly. Vercel handles the /api/users part based on filename.
app.use('/', userRoutes); 

// Export the app instance for Vercel
module.exports = app;
