const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * User registration route
 * @route POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.register
);

/**
 * User login route
 * @route POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
  authController.login
);

/**
 * Google authentication route
 * @route POST /api/auth/google
 */
router.post('/google', authController.googleAuth);

/**
 * Token refresh route
 * @route POST /api/auth/refresh-token
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken').not().isEmpty().withMessage('Refresh token is required')
  ],
  authController.refreshToken
);

module.exports = router;
