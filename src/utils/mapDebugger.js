import axios from 'axios';
import { loadGoogleMapsScript, isGoogleMapsApiLoaded } from './googleMapsLoader';

// Import resetGoogleMapsApiLoadAttempt directly from the file since we just added it
import { resetGoogleMapsApiLoadAttempt } from './googleMapsLoader';

// Get the API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

/**
 * Comprehensive function to diagnose Google Maps API issues
 * This will perform various tests to determine why maps aren't loading
 */
export const diagnoseMapsIssue = async () => {
  const results = {
    apiKeyPresent: !!GOOGLE_MAPS_API_KEY,
    apiKeyLength: GOOGLE_MAPS_API_KEY.length,
    isScriptLoaded: isGoogleMapsApiLoaded(),
    isWindowGoogleDefined: typeof window.google !== 'undefined',
    isMapsDefined: typeof window.google?.maps !== 'undefined',
    apiKeyValidationResult: null,
    scriptLoadResult: null,
    errors: []
  };

  // Test if API key works via directions API
  try {
    // Simple test to see if the API key is valid
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=${GOOGLE_MAPS_API_KEY}`,
      { timeout: 5000 }
    );
    
    if (response.data.status === 'REQUEST_DENIED') {
      results.apiKeyValidationResult = 'invalid';
      results.errors.push(`API key validation failed: ${response.data.error_message || 'Unknown error'}`);
    } else {
      results.apiKeyValidationResult = 'valid';
    }
  } catch (error) {
    results.apiKeyValidationResult = 'error';
    results.errors.push(`Error testing API key: ${error.message}`);
  }

  // If script isn't loaded, try to load it explicitly
  if (!results.isScriptLoaded) {
    try {
      // Try to load the script with explicit debugging
      await loadGoogleMapsScript({
        libraries: ['places'],
        debug: true
      });
      
      results.scriptLoadResult = 'success';
      results.isScriptLoaded = true;
      results.isWindowGoogleDefined = typeof window.google !== 'undefined';
      results.isMapsDefined = typeof window.google?.maps !== 'undefined';
    } catch (error) {
      results.scriptLoadResult = 'failed';
      results.errors.push(`Failed to load Google Maps script: ${error.message}`);
    }
  } else {
    results.scriptLoadResult = 'already_loaded';
  }

  return results;
};

/**
 * Check for common Google Maps console errors
 * Returns parsed error information if found, null otherwise
 */
export const checkForMapsConsoleErrors = () => {
  const errors = {
    foundErrors: false,
    invalidKey: false,
    missingKey: false,
    refererNotAllowed: false,
    quotaExceeded: false,
    billingNotEnabled: false,
    apiNotEnabled: false,
    loadError: false,
    consoleMessages: []
  };

  // This function can hook into the console to detect errors
  // In a real implementation, you would need to intercept console errors
  // For this example, we'll just check if window.google exists
  
  if (typeof window.google === 'undefined') {
    errors.foundErrors = true;
    errors.loadError = true;
    errors.consoleMessages.push('Google Maps API did not load properly. Check the console for detailed errors.');
  }
  
  // For billing not enabled, check if the map displays "For development purposes only"
  // This requires actually rendering a map, so we can't check it here directly
  
  return errors;
};

/**
 * Force reload Google Maps API script
 * This will remove any existing script tags and reset the load state
 */
export const forceReloadGoogleMapsApi = async () => {
  // First, remove any existing Google Maps script tags
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  existingScripts.forEach(script => script.remove());
  
  // Reset the Google object
  delete window.google;
  
  // Delay to ensure the DOM is updated
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Try to load the script again
  try {
    await loadGoogleMapsScript({
      libraries: ['places'],
      debug: true
    });
    return { success: true, message: 'Google Maps API reloaded successfully' };
  } catch (error) {
    return { success: false, message: `Failed to reload Google Maps API: ${error.message}` };
  }
};
