import axios from 'axios';

/**
 * API Debugger utility
 * 
 * This utility helps diagnose API issues by making test requests with
 * detailed logging and error reporting.
 */

// Base API URL - should match your backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Makes a test API request and returns detailed information about
 * the request and response or error
 * 
 * @param {string} endpoint - API endpoint to test, without leading slash
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {object} data - Request payload for POST/PUT/PATCH requests
 * @param {boolean} forceAuth - Whether to force the Authorization header
 * @returns {Promise<object>} - Detailed debug info about request/response
 */
export const testApiRequest = async (endpoint, method = 'GET', data = null, forceAuth = true) => {
  const token = localStorage.getItem('token');
  const fullUrl = `${API_URL}/${endpoint}`;
  
  const headers = {};
  
  // Set Authentication header if token exists or is forced
  if (token && forceAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add other common headers
  headers['Content-Type'] = 'application/json';
  
  // Log request details for debugging
  console.log('🚀 API Test Request:', {
    url: fullUrl,
    method,
    headers,
    data
  });
  
  try {
    // Make the request
    const response = await axios({
      url: fullUrl,
      method,
      headers,
      data
    });
    
    // Log success response
    console.log('✅ API Test Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    
    return {
      success: true,
      request: {
        url: fullUrl,
        method,
        headers,
        data
      },
      response: {
        status: response.status,
        headers: response.headers,
        data: response.data
      }
    };
  } catch (error) {
    // Log detailed error information
    console.error('❌ API Test Error:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    });
    
    return {
      success: false,
      request: {
        url: fullUrl,
        method,
        headers,
        data
      },
      error: {
        message: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
        data: error.response?.data
      }
    };
  }
};

/**
 * Specific test for checking if authentication is working
 */
export const testAuthentication = async () => {
  return testApiRequest('users/profile', 'GET');
};

/**
 * Test offering a ride with coordinate formats
 */
export const testOfferRide = async (useLatLng = false) => {
  // Sample test data with coordinates in both formats for testing
  const rideData = {
    pickupLocation: useLatLng ? {
      address: "Test Start Location",
      lat: 42.2626,  // Wrong format (frontend format)
      lng: -71.8023  // Wrong format (frontend format)
    } : {
      address: "Test Start Location",
      latitude: 42.2626,  // Correct format (backend format)
      longitude: -71.8023  // Correct format (backend format)
    },
    dropoffLocation: useLatLng ? {
      address: "Test End Location",
      lat: 42.3551,  // Wrong format (frontend format)
      lng: -71.0657  // Wrong format (frontend format)
    } : {
      address: "Test End Location",
      latitude: 42.3551,  // Correct format (backend format)
      longitude: -71.0657  // Correct format (backend format)
    },
    departureDate: "2025-05-01",
    departureTime: "10:00",
    maxPassengers: 3,
    price: 25.00,
    vehicle: {
      model: "Test Vehicle Model",
      color: "Black",
      licensePlate: "TEST123"
    }
  };

  return testApiRequest('rides/offer', 'POST', rideData);
};

/**
 * Check if CORS is properly configured
 */
export const testCors = async () => {
  // Send OPTIONS request to check CORS config
  try {
    const response = await axios({
      url: `${API_URL}/rides/offer`,
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    return {
      success: true,
      corsHeaders: {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials']
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        headers: error.response?.headers
      }
    };
  }
};

// Assign the object to a variable before exporting
const apiDebugger = {
  testApiRequest,
  testAuthentication,
  testOfferRide,
  testCors
};

export default apiDebugger;
