console.log('--- backend/src/server.js loaded ---'); // Vercel diagnostic log
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { sequelize, syncDatabase } = require('./models/index');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Apply middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow cross-origin resource sharing
})); // Set security headers

// Use our custom CORS middleware for development - more permissive
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);

// Or use the cors package with more permissive settings
// app.use(cors({
//   origin: '*', // Allow all origins
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Static file serving (for profile pictures, etc.) - path updated after moving to /api directory
// Assuming 'uploads' directory is in the project root
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'))); 

// Set up API routes - all of our routes will be prefixed with /api
app.use('/api', routes); // Use the main router index

// Error handling middleware - should be last
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    // Test database connection
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      console.error('Failed to connect to the database. Server will not start.');
      process.exit(1); // Consider removing this for better error handling in production
    }
    
    // Sync database models (set to true to force recreate tables - use carefully)
    // In production (NODE_ENV=production), force should be false
    const force = process.env.NODE_ENV === 'development' && process.env.DB_SYNC_FORCE === 'true'; 
    console.log(`Database sync starting (force: ${force})...`);
    await syncDatabase(force);
    console.log('Database sync completed.');
    
    // Start server - explicit listen for Render.com to detect the port
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    console.log('Server startup complete.');
  } catch (error) {
    console.error('Failed during server startup sequence:', error);
    process.exit(1); // Consider removing this for better error handling in production
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't crash the server, just log the error
});

// Immediately invoke startServer to ensure DB connection and sync happen
// before the module might be required by Vercel's function handler.
// We wrap the export in a promise that resolves after startServer completes.
let serverReadyPromise = startServer().then(() => app).catch(err => {
  console.error("CRITICAL: startServer failed, exporting null.", err);
  // Exporting null or re-throwing might be options depending on desired Vercel behavior on failure
  return null; 
});

// Export a promise that resolves to the app instance *after* startup logic
module.exports = serverReadyPromise;
