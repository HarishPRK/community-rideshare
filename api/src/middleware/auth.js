const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format. Please use Bearer format.' });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Account is not active. Please contact support.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Authentication error. Please try again.' });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has a role that is allowed
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access this resource.'
      });
    }
    
    // User has required role, continue
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
