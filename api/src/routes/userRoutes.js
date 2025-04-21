const express = require('express');
const { body, param } = require('express-validator');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path for file handling
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (e.g., 5MB)
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
  }
}).single('profilePicture'); // Expect a single file field named 'profilePicture'

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

/**
 * Get current user profile
 * @route GET /api/users/profile
 */
router.get('/profile', userController.getCurrentUser);

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
router.put(
  '/profile',
  // Apply multer middleware first to handle multipart/form-data
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.error("Unknown upload error:", err);
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
      }
      // Everything went fine, proceed to validation.
      next();
    });
  },
  // Now validate the fields which multer put into req.body
  [
    body('firstName').optional().trim().not().isEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().not().isEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().trim().isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number format'),
    body('address').optional().trim(),
    body('bio').optional().trim(),
    body('preferredPaymentMethod').optional().trim(),
    // Basic validation for vehicle JSON string (can be enhanced)
    body('vehicle').optional().isJSON().withMessage('Vehicle data must be a valid JSON string')
    // Note: We don't validate req.file here, multer handles file filtering
  ],
  userController.updateProfile // Finally, call the controller
);

/**
 * Change user password
 * @route PUT /api/users/password
 */
router.put(
  '/password',
  [
    body('currentPassword').not().isEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  userController.changePassword
);

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
router.get(
  '/:id',
  [
    param('id').isString().withMessage('Invalid user ID')
  ],
  userController.getUserById
);

/**
 * Upgrade user to driver role
 * @route PUT /api/users/become-driver
 */
router.put('/become-driver', userController.becomeDriver);

module.exports = router;
