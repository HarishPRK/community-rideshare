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
app.use('/api', routes);

// Error handling middleware - should be last
app.use(errorHandler);

// // Connect to database and start server --- Temporarily commented out for Vercel diagnosis ---
// const startServer = async () => {
//   try {
//     // Test database connection
//     try {
//       await sequelize.authenticate();
//       console.log('Database connection has been established successfully.');
//     } catch (error) {
//       console.error('Unable to connect to the database:', error);
//       console.error('Failed to connect to the database. Server will not start.');
//       process.exit(1); // Problematic in serverless
//     }
    
//     // Sync database models (set to true to force recreate tables - use carefully)
//     const force = process.env.NODE_ENV === 'development' && process.env.DB_SYNC_FORCE === 'true';
//     await syncDatabase(force);
    
//     // Start server - Vercel handles listening, not app.listen()
//     // app.listen(PORT, () => {
//     //   console.log(`Server running on port ${PORT}`);
//     //   console.log(`API available at http://localhost:${PORT}/api`);
//     //   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     // });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1); // Problematic in serverless
//   }
// };

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't crash the server, just log the error
});

// // Start the server --- Temporarily commented out for Vercel diagnosis ---
// startServer();

// Export the Express app for Vercel
module.exports = app;
