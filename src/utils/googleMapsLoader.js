/**
 * Google Maps Script Loader Utility
 * 
 * This utility ensures Google Maps API is loaded only once with consistent configuration.
 * It prevents the "Loader must not be called again with different options" error and handles
 * loading the API in a lazy manner to avoid unnecessary API calls.
 */

import { getGoogleMapsApiKey } from './mapUtils';

// Track loading status - these variables persist across component renders
let isLoading = false;
let isLoaded = false;
let loadPromise = null;
let loadedCallbacks = [];
let loadAttempted = false;

// Check if the API is loaded at startup - needed to handle page refreshes
if (typeof window !== 'undefined' && window.google && window.google.maps) {
  isLoaded = true;
}

/**
 * Load the Google Maps API script
 * @param {Object} options - Options for loading the Google Maps script
 * @returns {Promise} A promise that resolves when the script is loaded
 */
export const loadGoogleMapsScript = (options = {}) => {
  // If already loaded, return a resolved promise
  if (isLoaded) {
    return Promise.resolve(window.google);
  }
  
  // If loading is in progress, return the existing promise
  if (isLoading) {
    return loadPromise;
  }
  
  // Get API key from environment
  const { apiKey } = getGoogleMapsApiKey();
  
  if (!apiKey) {
    console.error('Google Maps API key is missing or invalid');
    return Promise.reject(new Error('Google Maps API key is missing or invalid'));
  }
  
  // Default options
  const defaultOptions = {
    key: apiKey,
    libraries: ['places'],
    version: 'weekly',
    language: 'en',
    region: 'US',
    callback: null // Function to call after successful loading
  };
  
  // Merge default options with provided options
  const finalOptions = { ...defaultOptions, ...options };
  
  // Set loading flag
  isLoading = true;
  
  // Create the loading promise
  loadPromise = new Promise((resolve, reject) => {
    // Create callback function
    const callbackName = 'googleMapsInitialized_' + Math.random().toString(36).substring(2, 9);
    
    window[callbackName] = () => {
      isLoaded = true;
      isLoading = false;
      console.log('Google Maps API loaded successfully');
      
      // Handle the "AuthFailure" error that sometimes appears
      if (window.google && window.google.maps && window.google.maps.authFailure) {
        const originalAuthFailure = window.google.maps.authFailure;
        window.google.maps.authFailure = function() {
          console.error('Google Maps API key authorization failed. This could be due to:');
          console.error('- Domain restrictions on your API key');
          console.error('- Billing not enabled on your Google Cloud account');
          console.error('- API key usage restrictions');
          
          // Call original handler if it exists
          if (originalAuthFailure) originalAuthFailure.call(this);
        };
      }
      
      // Clean up callback name
      delete window[callbackName];
      
      // Execute callback if provided in options
      if (typeof finalOptions.callback === 'function') {
        try {
          finalOptions.callback(window.google);
        } catch (e) {
          console.error('Error in Google Maps callback:', e);
        }
      }
      
      // Execute any registered callbacks
      loadedCallbacks.forEach(callback => {
        try {
          callback(window.google);
        } catch (e) {
          console.error('Error in Google Maps loaded callback:', e);
        }
      });
      loadedCallbacks = [];
      
      // Resolve the promise
      resolve(window.google);
    };
    
    // Append script to document
    const script = document.createElement('script');
    
    // Build URL - include error handler
    let url = `https://maps.googleapis.com/maps/api/js?key=${finalOptions.key}&callback=${callbackName}`;
  
    // Add libraries
    if (finalOptions.libraries && finalOptions.libraries.length) {
      url += `&libraries=${finalOptions.libraries.join(',')}`;
    }
    
    // Add other parameters
    if (finalOptions.version) {
      url += `&v=${finalOptions.version}`;
    }
    
    if (finalOptions.language) {
      url += `&language=${finalOptions.language}`;
    }
    
    if (finalOptions.region) {
      url += `&region=${finalOptions.region}`;
    }
    
    // Log URL for debugging (without the API key for security)
    console.log('Loading Google Maps with URL pattern:', url.replace(finalOptions.key, 'API_KEY_HIDDEN'));
    
    // Configure script
    script.src = url;
    script.async = true;
    script.defer = true;
    
    // Handle script loading errors
    script.onerror = (error) => {
      console.error('Google Maps API failed to load', error);
      isLoading = false;
      
      // Clean up
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      reject(new Error(`Google Maps script failed to load. This could be due to network issues, 
        API key restrictions, or billing problems with your Google Cloud account.`));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
  
  return loadPromise;
};

/**
 * Check if Google Maps API is already loaded
 * @returns {boolean} True if Google Maps API is loaded
 */
export const isGoogleMapsApiLoaded = () => {
  // Update the isLoaded variable if Google Maps was loaded some other way
  if (!isLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    isLoaded = true;
  }
  return isLoaded;
};

/**
 * Register a callback to be executed when Google Maps is loaded
 * @param {Function} callback - The function to call when Google Maps is loaded
 */
export const onGoogleMapsLoaded = (callback) => {
  if (isLoaded && window.google && window.google.maps) {
    // Execute immediately if already loaded
    callback(window.google);
  } else {
    // Store callback for later execution
    loadedCallbacks.push(callback);
  }
};

/**
 * Fix common Google Maps loading issues
 */
/**
 * Reset the Google Maps API load attempt status
 * This is useful when you want to force a reload of the API
 */
export const resetGoogleMapsApiLoadAttempt = () => {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
  loadAttempted = false;
  
  // Check if script tags need to be removed
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    scripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    
    // Clear any Google Maps objects that might exist
    if (window.google && window.google.maps) {
      try {
        delete window.google.maps;
        console.log('Google Maps objects cleared');
      } catch (e) {
        console.error('Failed to clear Google Maps objects:', e);
      }
    }
  }
  
  console.log('Google Maps API load attempt reset');
};

export const fixGoogleMapsLoadingIssues = () => {
  // Fix for "This page can't load Google Maps correctly" error
  if (typeof window !== 'undefined') {
    // Temporarily override any existing google.maps object to prevent the error message
    // This is a common workaround for the "This page can't load Google Maps correctly" error
    if (window.google && !window.google._mapsFixApplied) {
      const originalMaps = window.google.maps;
      window.google._mapsFixApplied = true;
      
      // If maps is already defined but not fully loaded, provide temporary placeholders
      if (!originalMaps || !originalMaps.places) {
        window.google.maps = {
          ...originalMaps,
          places: window.google.maps?.places || {},
          // Add other commonly used namespaces
          visualization: window.google.maps?.visualization || {},
          drawing: window.google.maps?.drawing || {}
        };
      }
    }
  }
};

// Apply fixes immediately
fixGoogleMapsLoadingIssues();
