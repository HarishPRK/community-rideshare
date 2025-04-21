const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'community_rideshare_secret_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generate JWT token for authenticated user
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * Generate refresh token for extended sessions
 * @param {object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      tokenType: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader,
};
