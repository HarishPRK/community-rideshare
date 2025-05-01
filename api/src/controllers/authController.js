const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Create new user
    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      password,
      phoneNumber,
      role: 'USER',
      status: 'ACTIVE',
      rating: 0,
      ratingCount: 0
    });
    
    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google authentication
 * @route POST /api/auth/google
 */
const googleAuth = async (req, res, next) => {
  try {
    const { token, userData } = req.body;
    
    if (!token || !userData || !userData.email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Token and user data are required.'
      });
    }
    
    // In a production environment, we would verify the Google token
    // For now, we'll trust it and just create/update the user
    
    // Find user by email
    let user = await User.findOne({ where: { email: userData.email } });
    
    if (user) {
      // Update existing user
      user.name = userData.name || user.name;
      user.profilePicture = userData.photoURL || user.profilePicture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        id: uuidv4(),
        name: userData.name,
        email: userData.email,
        password: uuidv4(), // Generate random password (user can't use this to login directly)
        profilePicture: userData.photoURL,
        role: 'USER',
        status: 'ACTIVE',
        rating: 0,
        ratingCount: 0
      });
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user and token
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: user.toJSON(),
      token: jwtToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token (would be implemented in a more secure way in production)
    const decoded = require('../utils/jwt').verifyToken(refreshToken);
    
    if (!decoded || decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Return new tokens
    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken
};
