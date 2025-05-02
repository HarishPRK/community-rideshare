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
      console.log(`apiService: Fetching ride details for ID ${rideId}`);
      
      // Add additional logging to check headers
      console.log('apiService: Request headers:', axios.defaults.headers.common);
      
      // Make sure we have a token in the headers
      const token = localStorage.getItem('token');
      if (!token) {
        // For development/testing, use a test token if needed
        const testToken = 'test-token-for-debugging';
        localStorage.setItem('token', testToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${testToken}`;
        console.log('apiService: Added test token to headers');
      }
      
      const response = await axios.get(`${API_URL}/rides/${rideId}`);
      console.log('apiService: Ride details raw response:', response);
      
      // Handle different response structures
      if (response.data && typeof response.data === 'object') {
        return response.data;
      } else {
        console.error('apiService: Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error(`apiService: Error fetching ride details for ID ${rideId}:`, error);
      
      if (error.response) {
        console.error('apiService: Error response data:', error.response.data);
        console.error('apiService: Error response status:', error.response.status);
      }
      
      throw handleApiError(error);
    }
  },

  /**
   * Request to join an existing ride as a passenger (or create a standalone request - endpoint seems overloaded)
   * @param {Object} requestData - Data for the request (may include rideId for joining, or full details for new request)
   * @returns {Promise} Promise resolving to API response
   */
  requestRide: async (requestData) => { // Reverted rename back to requestRide
    try {
      // Reverted endpoint back to /rides/request as per backend routes
      console.log('API Service - Requesting ride with URL:', `${API_URL}/rides/request`, 'and data:', requestData);
      const response = await axios.post(`${API_URL}/rides/request`, requestData); // Sends original requestData
      console.log('API Service - Ride request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Ride request error:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Offer a new ride as a driver
   * @param {Object} rideData - Complete ride details (pickup, dropoff, time, etc.)
   * @returns {Promise} Promise resolving to API response
   */
  offerRide: async (rideData) => {
    try {
      // Set a token for testing (if one doesn't exist)
      const token = localStorage.getItem('token') || 'dummy-test-token';
      
      // Log the full request details for debugging
      console.log('API Service - Offering ride with URL:', `${API_URL}/rides/offer`);
      console.log('API Service - Request data:', JSON.stringify(rideData, null, 2));
      
      // In development mode with simplified auth, we don't actually need a real token
      // Our simplifiedAuth middleware will handle authentication
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${API_URL}/rides/offer`, rideData, { headers });
      console.log('API Service - Ride offer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Ride offer error:', error.message);
      console.error('API Service - Error response:', error.response?.data);
      console.error('API Service - Error status:', error.response?.status);
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

// Assign the object to a variable before exporting
const apiService = {
  auth: authService,
  user: userService,
  ride: rideService
};

export default apiService;
