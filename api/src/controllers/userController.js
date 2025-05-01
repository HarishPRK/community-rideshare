const { User, Vehicle } = require('../models');

/**
 * Get current user profile
 * @route GET /api/users/profile
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is attached to req by auth middleware
    const userId = req.user.id;
    
    // Get user with vehicles
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Vehicle,
          as: 'vehicles'
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Use correct field names from FormData and include vehicle data
    const { firstName, lastName, phone, address, bio, preferredPaymentMethod, vehicle: vehicleJsonString } = req.body;
    
    // Get user with vehicles association to potentially update/create
    const user = await User.findByPk(userId, {
      include: [{ model: Vehicle, as: 'vehicles' }] // Include vehicles
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields from req.body
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // Combine firstName and lastName for the 'name' field if it exists in the model
    if (firstName || lastName) {
       user.name = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim();
    }
    if (phone) user.phone = phone; // Use 'phone'
    if (address) user.address = address;
    if (bio) user.bio = bio;
    if (preferredPaymentMethod) user.preferredPaymentMethod = preferredPaymentMethod;
    
    // Handle profile picture if uploaded (Multer middleware attaches file to req.file)
    if (req.file) {
      // In a production app, we would upload to cloud storage
      // Here we'll just store the file path
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Handle Vehicle Update/Creation
    if (vehicleJsonString) {
      console.log("Received vehicle JSON string:", vehicleJsonString); // Log received string
      try {
        const vehicleData = JSON.parse(vehicleJsonString);
        console.log("Parsed vehicle data:", vehicleData); // Log parsed data

        if (vehicleData && typeof vehicleData === 'object') {
          // Assuming a user has only one vehicle for simplicity based on frontend
          let userVehicle = user.vehicles && user.vehicles.length > 0 ? user.vehicles[0] : null;
          console.log("Existing user vehicle:", userVehicle ? userVehicle.toJSON() : 'None'); // Log existing vehicle

          if (userVehicle) {
            console.log("Attempting to update existing vehicle ID:", userVehicle.id);
            // Update existing vehicle
            const updateResult = await userVehicle.update({
              model: vehicleData.model,
              color: vehicleData.color,
              year: vehicleData.year,
              licensePlate: vehicleData.licensePlate,
              capacity: vehicleData.seats // Match frontend 'seats' to backend 'capacity'
            });
            console.log(`Vehicle ${userVehicle.id} updated for user ${userId}. Result:`, updateResult);
          } else if (vehicleData.model && vehicleData.licensePlate) {
            console.log("Attempting to create new vehicle for user:", userId);
            // Create new vehicle if model and license plate are provided
            const newVehicleData = {
              userId: userId,
              model: vehicleData.model,
              color: vehicleData.color,
              year: vehicleData.year,
              licensePlate: vehicleData.licensePlate,
              capacity: vehicleData.seats // Match frontend 'seats' to backend 'capacity'
            };
            console.log("New vehicle data:", newVehicleData);
            userVehicle = await Vehicle.create(newVehicleData);
            console.log(`Vehicle ${userVehicle.id} created for user ${userId}. Result:`, userVehicle.toJSON());
            // Associate with user if needed (might be handled by userId foreign key)
            // await user.addVehicle(userVehicle); // Or similar Sequelize association method
          } else {
             console.log("Skipping vehicle creation/update: model or licensePlate missing, or no existing vehicle found.");
          }
        } else {
           console.log("Skipping vehicle handling: parsed vehicle data is not a valid object.");
        }
      } catch (vehicleError) {
        // Log specific vehicle processing errors
        console.error("Error processing vehicle data:", vehicleError); 
        // Decide if this should be a blocking error or just a warning
        // return next(new Error('Failed to process vehicle data: ' + vehicleError.message)); 
      }
    } else {
       console.log("No vehicle JSON string received in request body.");
    }
    
    console.log("Attempting to save user profile changes for user:", userId);
    // Save updated user
    await user.save();
    console.log("User profile saved successfully for user:", userId);

    console.log("Refetching user with updated data for user:", userId);
    // Refetch user with updated vehicle data to return
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Vehicle, as: 'vehicles' }]
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON() // Return user with potentially updated vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route PUT /api/users/password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Get user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get user with basic info only
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'profilePicture', 'rating', 'ratingCount']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upgrade user to driver role
 * @route PUT /api/users/become-driver
 */
const becomeDriver = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update role to driver
    user.role = 'DRIVER';
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User upgraded to driver successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  changePassword,
  getUserById,
  becomeDriver
};
