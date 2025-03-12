/**
 * Utility functions for the Community RideShare application
 */

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - Date string in ISO format
 * @param {object} options - Format options for toLocaleDateString
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';
    
    const defaultOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', defaultOptions);
  };
  
  /**
   * Format a time string to a human-readable format
   * @param {string} timeString - Time string (e.g., "14:30")
   * @returns {string} Formatted time string (e.g., "2:30 PM")
   */
  export const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in miles
   */
  export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };
  
  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };
  
  /**
   * Calculate the estimated travel time between two points based on distance
   * @param {number} distanceInMiles - Distance in miles
   * @param {number} avgSpeedMph - Average speed in mph (default: 30)
   * @returns {string} Formatted travel time
   */
  export const calculateTravelTime = (distanceInMiles, avgSpeedMph = 30) => {
    const timeInHours = distanceInMiles / avgSpeedMph;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };
  
  /**
   * Format price as currency
   * @param {number} price - Price value
   * @param {string} currency - Currency code (default: 'USD')
   * @returns {string} Formatted price
   */
  export const formatCurrency = (price, currency = 'USD') => {
    if (price === undefined || price === null) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  /**
   * Get status badge variant based on ride status
   * @param {string} status - Ride status
   * @returns {string} Bootstrap variant name
   */
  export const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  /**
   * Get human-readable text for ride status
   * @param {string} status - Ride status
   * @returns {string} Human-readable status
   */
  export const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  /**
   * Truncate text if it exceeds maxLength
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length (default: 100)
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.slice(0, maxLength) + '...';
  };
  
  /**
   * Get user's current geolocation
   * @returns {Promise} Promise resolving to {latitude, longitude} object
   */
  export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };
  
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export const isValidPhone = (phone) => {
    const regex = /^[\d\s()+-]{10,15}$/;
    return regex.test(phone);
  };
  
  /**
   * Calculate suggested ride price
   * @param {number} distanceInMiles - Distance in miles
   * @param {number} baseRate - Base fare (default: 5.00)
   * @param {number} ratePerMile - Rate per mile (default: 0.50)
   * @returns {number} Suggested price
   */
  export const calculateSuggestedPrice = (distanceInMiles, baseRate = 5.00, ratePerMile = 0.50) => {
    if (!distanceInMiles) return baseRate;
    
    const price = baseRate + (distanceInMiles * ratePerMile);
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  };
  
  /**
   * Get ride price per passenger
   * @param {number} totalPrice - Total ride price
   * @param {number} maxPassengers - Maximum number of passengers
   * @returns {number} Price per passenger
   */
  export const getPricePerPassenger = (totalPrice, maxPassengers) => {
    if (!totalPrice || !maxPassengers || maxPassengers < 1) return 0;
    
    const pricePerPassenger = totalPrice / maxPassengers;
    return Math.round(pricePerPassenger * 100) / 100; // Round to 2 decimal places
  };
  
  /**
   * Convert a file to base64 string
   * @param {File} file - File object
   * @returns {Promise} Promise resolving to base64 string
   */
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  /**
   * Check if a ride needs a rating
   * @param {Object} ride - Ride object
   * @param {string} userId - Current user ID
   * @returns {boolean} True if needs rating, false otherwise
   */
  export const needsRating = (ride, userId) => {
    return (
      ride.status === 'completed' &&
      ride.rider?.id === userId &&
      !ride.rating
    );
  };
  
  /**
   * Convert ratings to star display (e.g., "★★★☆☆")
   * @param {number} rating - Rating value (0-5)
   * @returns {string} Star representation
   */
  export const ratingToStars = (rating) => {
    if (!rating) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };
  
  export default {
    formatDate,
    formatTime,
    calculateDistance,
    calculateTravelTime,
    formatCurrency,
    getStatusBadgeVariant,
    getStatusText,
    truncateText,
    getCurrentLocation,
    isValidEmail,
    isValidPhone,
    calculateSuggestedPrice,
    getPricePerPassenger,
    fileToBase64,
    needsRating,
    ratingToStars
  };