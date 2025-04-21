/**
 * Google Maps Singleton Loader
 * 
 * This is a strictly singleton implementation of Google Maps loader that ensures
 * the API is loaded exactly once with consistent parameters. It fixes the
 * "Loader must not be called again with different options" error.
 */

// Consistent configuration that will be used for all load attempts
const DEFAULT_CONFIG = {
  libraries: ['places'],
  version: 'weekly',
  language: 'en',
  region: 'US'
};

// Singleton state
let isLoaded = false;
let isLoading = false;
let loadPromise = null;
let apiKey = null;

// Check if Maps is already loaded in the window
if (typeof window !== 'undefined' && window.google && window.google.maps) {
  isLoaded = true;
}

/**
 * Initialize the Google Maps loader with API key
 * Must be called before any other methods
 */
export function initGoogleMaps(key) {
  if (!key) {
    console.error('GoogleMapsSingleton: API key is required');
    return false;
  }
  
  apiKey = key;
  return true;
}

/**
 * Load Google Maps API - returns same promise if already loading/loaded
 */
export function loadGoogleMaps() {
  // If already loaded, return resolved promise
  if (isLoaded) {
    return Promise.resolve(window.google);
  }
  
  // If loading is in progress, return existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  // Check for API key
  if (!apiKey) {
    console.error('GoogleMapsSingleton: Call initGoogleMaps with API key first');
    return Promise.reject(new Error('Google Maps API key not provided'));
  }
  
  // Clear any existing Google Maps scripts to prevent conflicts
  clearExistingMapScripts();
  
  // Set loading state
  isLoading = true;
  
  // Create loading promise
  loadPromise = new Promise((resolve, reject) => {
    // Create a unique callback name
    const callbackName = `googleMapsCallback_${Date.now()}`;
    
    // Create callback function
    window[callbackName] = () => {
      // Mark as loaded and clean up
      isLoaded = true;
      isLoading = false;
      delete window[callbackName];
      
      // Resolve the promise with google object
      resolve(window.google);
      
      console.log('GoogleMapsSingleton: Maps API loaded successfully');
    };
    
    // Create script element
    const script = document.createElement('script');
    
    // Build URL with consistent parameters
    let url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
    
    // Add libraries
    if (DEFAULT_CONFIG.libraries && DEFAULT_CONFIG.libraries.length) {
      url += `&libraries=${DEFAULT_CONFIG.libraries.join(',')}`;
    }
    
    // Add other parameters
    if (DEFAULT_CONFIG.version) {
      url += `&v=${DEFAULT_CONFIG.version}`;
    }
    
    if (DEFAULT_CONFIG.language) {
      url += `&language=${DEFAULT_CONFIG.language}`;
    }
    
    if (DEFAULT_CONFIG.region) {
      url += `&region=${DEFAULT_CONFIG.region}`;
    }
    
    // Set script properties
    script.src = url;
    script.async = true;
    script.defer = true;
    
    // Handle loading errors
    script.onerror = (error) => {
      console.error('GoogleMapsSingleton: Failed to load Maps API', error);
      
      // Reset state
      isLoading = false;
      
      // Clean up
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      reject(new Error('Failed to load Google Maps API'));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
  
  return loadPromise;
}

/**
 * Check if Google Maps API is loaded
 */
export function isGoogleMapsLoaded() {
  // Double check in case it was loaded outside our control
  if (!isLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    isLoaded = true;
  }
  
  return isLoaded;
}

/**
 * Clear any existing Google Maps scripts
 */
function clearExistingMapScripts() {
  if (typeof window === 'undefined') return;
  
  // Remove any existing Google Maps scripts
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  scripts.forEach(script => {
    if (script.parentNode) {
      console.log('GoogleMapsSingleton: Removing existing Maps script');
      script.parentNode.removeChild(script);
    }
  });
  
  // Remove any Google Maps callbacks
  for (const key in window) {
    if (key.includes('googleMapsCallback') || key.includes('gm_authFailure')) {
      delete window[key];
    }
  }
}

/**
 * Reset the loader state - use only for testing/debugging
 */
export function resetGoogleMapsLoader() {
  isLoaded = false;
  isLoading = false;
  loadPromise = null;
  
  // Clear Google objects if they exist
  if (typeof window !== 'undefined' && window.google) {
    if (window.google.maps) {
      try {
        delete window.google.maps;
      } catch (e) {
        console.error('Failed to clear google.maps object', e);
      }
    }
  }
  
  clearExistingMapScripts();
}

// Default export for convenience
const GoogleMapsSingleton = {
  init: initGoogleMaps,
  load: loadGoogleMaps,
  isLoaded: isGoogleMapsLoaded,
  reset: resetGoogleMapsLoader
};

export default GoogleMapsSingleton;
