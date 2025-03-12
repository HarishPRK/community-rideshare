import axios from 'axios';

/**
 * API Service module for handling all HTTP requests to the backend
 */

// Base API URL - should match your backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise resolving to API response
   */
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} Promise resolving to API response
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Store token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Set token in axios headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Logout the current user
   */
  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  },

  /**
   * Get the current user's profile
   * @returns {Promise} Promise resolving to API response
   */
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Check if the current user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

/**
 * User Service
 */
export const userService = {
  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Promise resolving to API response
   */
  updateProfile: async (profileData) => {
    try {
      // Handle FormData for file uploads
      if (profileData instanceof FormData) {
        const response = await axios.put(`${API_URL}/users/profile`, profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await axios.put(`${API_URL}/users/profile`, profileData);
        return response.data;
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} Promise resolving to API response
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axios.put(`${API_URL}/users/password`, passwordData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} Promise resolving to API response
   */
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

/**
 * Ride Service
 */
export const rideService = {
  /**
   * Get available rides
   * @returns {Promise} Promise resolving to API response
   */
  getAvailableRides: async () => {
    try {
      const response = await axios.get(`${API_URL}/rides/available`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get rides requested by the current user
   * @returns {Promise} Promise resolving to API response
   */
  getRequestedRides: async () => {
    try {
      const response = await axios.get(`${API_URL}/rides/requested`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get rides offered by the current user
   * @returns {Promise} Promise resolving to API response
   */
  getOfferedRides: async () => {
    try {
      const response = await axios.get(`${API_URL}/rides/offered`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get ride details by ID
   * @param {string} rideId - Ride ID
   * @returns {Promise} Promise resolving to API response
   */
  getRideById: async (rideId) => {
    try {
      const response = await axios.get(`${API_URL}/rides/${rideId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Request a new ride
   * @param {Object} rideData - Ride request data
   * @returns {Promise} Promise resolving to API response
   */
  requestRide: async (rideData) => {
    try {
      const response = await axios.post(`${API_URL}/rides/request`, rideData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Offer a new ride
   * @param {Object} rideData - Ride offer data
   * @returns {Promise} Promise resolving to API response
   */
  offerRide: async (rideData) => {
    try {
      const response = await axios.post(`${API_URL}/rides/offer`, rideData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Accept a ride request (for drivers)
   * @param {string} rideId - Ride ID
   * @returns {Promise} Promise resolving to API response
   */
  acceptRide: async (rideId) => {
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/accept`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Start a ride (for drivers)
   * @param {string} rideId - Ride ID
   * @returns {Promise} Promise resolving to API response
   */
  startRide: async (rideId) => {
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/start`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Complete a ride (for drivers)
   * @param {string} rideId - Ride ID
   * @returns {Promise} Promise resolving to API response
   */
  completeRide: async (rideId) => {
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/complete`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Cancel a ride
   * @param {string} rideId - Ride ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Promise resolving to API response
   */
  cancelRide: async (rideId, reason) => {
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Rate a completed ride
   * @param {string} rideId - Ride ID
   * @param {Object} ratingData - Rating data
   * @returns {Promise} Promise resolving to API response
   */
  rateRide: async (rideId, ratingData) => {
    try {
      const response = await axios.post(`${API_URL}/rides/${rideId}/rate`, ratingData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Search for rides based on criteria
   * @param {Object} searchCriteria - Search criteria
   * @returns {Promise} Promise resolving to API response
   */
  searchRides: async (searchCriteria) => {
    try {
      const response = await axios.post(`${API_URL}/rides/search`, searchCriteria);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

/**
 * Helper to handle API errors
 * @param {Error} error - Axios error object
 * @returns {Error} Standardized error
 */
const handleApiError = (error) => {
  // Create a standardized error object
  const customError = new Error(
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred'
  );
  
  // Attach status code if available
  if (error.response) {
    customError.statusCode = error.response.status;
  }
  
  // Attach original error for debugging
  customError.originalError = error;
  
  return customError;
};

export default {
  auth: authService,
  user: userService,
  ride: rideService
};