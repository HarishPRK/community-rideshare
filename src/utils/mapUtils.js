/**
 * Utility functions for Google Maps integration
 */

/**
 * Get the Google Maps API key from environment variables with validation
 * @returns {Object} Object containing the API key and validation status
 */
export const getGoogleMapsApiKey = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  // Check if API key exists
  const isValid = apiKey && apiKey.length > 10;
  
  // Log information about the API key status
  if (!isValid) {
    console.error('Google Maps API key is missing or invalid in environment variables');
  }
  
  return {
    apiKey,
    isValid
  };
};

/**
 * Validate if Google Maps has loaded correctly
 * @returns {boolean} True if Google Maps is available in the window object
 */
export const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined';
};

/**
 * Helper function to get readable error message from Google Maps load errors
 * @param {Error} error - The error object from the load failure
 * @returns {string} A human-readable error message
 */
export const getGoogleMapsErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  
  // Common error patterns from Google Maps API
  if (error.message?.includes('MissingKeyMapError')) {
    return 'API key is missing or invalid. Please check your API key configuration.';
  }
  
  if (error.message?.includes('InvalidKeyMapError') || error.message?.includes('RefererNotAllowedMapError')) {
    return 'API key is invalid or restricted. Make sure your API key is configured correctly in Google Cloud Console and has appropriate permissions.';
  }
  
  if (error.message?.includes('ApiNotActivatedMapError')) {
    return 'Google Maps JavaScript API is not enabled. Enable it in the Google Cloud Console.';
  }
  
  if (error.message?.includes('ExpiredKeyMapError')) {
    return 'API key has expired. Please check your billing and API key settings in Google Cloud Console.';
  }
  
  // Network related errors
  if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  return error.message || 'Failed to load Google Maps API';
};

/**
 * Get troubleshooting steps based on common Google Maps API issues
 * @param {Error} error - The error object from the load failure
 * @returns {Array} Array of troubleshooting steps
 */
export const getGoogleMapsTroubleshootingSteps = (error) => {
  const commonSteps = [
    "Verify that your .env file includes REACT_APP_GOOGLE_MAPS_API_KEY",
    "Restart your development server after making changes to .env",
    "Ensure the API key doesn't have any typos or extra characters"
  ];
  
  const specificSteps = [];
  
  if (error?.message?.includes('RefererNotAllowedMapError')) {
    specificSteps.push(
      "In Google Cloud Console, add your domain (including localhost) to the allowed referrers",
      "Make sure HTTP referrers are properly configured in API key restrictions"
    );
  }
  
  if (error?.message?.includes('ApiNotActivatedMapError')) {
    specificSteps.push(
      "In Google Cloud Console, enable the 'Maps JavaScript API'",
      "Also enable the 'Places API' if you're using autocomplete features"
    );
  }
  
  if (error?.message?.includes('ExpiredKeyMapError') || error?.message?.includes('BillingError')) {
    specificSteps.push(
      "Check your Google Cloud billing status",
      "Verify that billing is enabled for your project"
    );
  }
  
  return [...specificSteps, ...commonSteps];
};
