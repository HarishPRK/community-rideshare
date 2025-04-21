/**
 * Global error handling middleware
 * Provides consistent error responses across the API
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('ERROR:', err);
  
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    // Validation errors from Sequelize
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    // Unique constraint errors
    statusCode = 409;
    message = 'A record with this information already exists';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // Expired JWT
    statusCode = 401;
    message = 'Token expired';
  } else if (err.status) {
    // Use status code from error if available
    statusCode = err.status;
    message = err.message;
  } else if (err.statusCode) {
    // Alternative property name for status code
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.message) {
    // Use error message if available
    message = err.message;
  }
  
  // Respond with error in JSON format
  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace in development mode only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
