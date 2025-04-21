import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Spinner, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaLocationArrow, FaTimes } from 'react-icons/fa';

/**
 * LocationAutocomplete - A component for address input with Google Places autocomplete
 * 
 * Uses Google Places API for address suggestions and geocoding
 * Returns both formatted address and coordinates
 */
const LocationAutocomplete = ({
  id,
  label,
  placeholder = 'Enter an address',
  value = '',
  onChange,
  onSelect,
  onClear,
  required = false,
  disabled = false,
  error = null,
  icon = <FaMapMarkerAlt />,
  showCurrentLocation = false,
  useGoogleMapsLoader = true,
  allowClear = true,
  className = '',
  helpText = null,
  apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // Initialize autocomplete when the component mounts
  useEffect(() => {
    let autocomplete = null;
    let googleAvailable = !!window.google?.maps?.places;
    
    // If Google Maps API is not already loaded
    if (!googleAvailable && useGoogleMapsLoader && apiKey) {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initAutocomplete();
      };
      document.head.appendChild(script);
      
      return () => {
        // Cleanup script when component unmounts
        document.head.removeChild(script);
      };
    } else if (googleAvailable) {
      initAutocomplete();
    }
    
    function initAutocomplete() {
      if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry'],
        });
        
        autocompleteRef.current = autocomplete;
        
        autocomplete.addListener('place_changed', handlePlaceSelect);
      }
    }
    
    return () => {
      // Cleanup Google Maps event listener
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [apiKey, useGoogleMapsLoader]);
  
  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;
    
    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a place but the API couldn't find it
      return;
    }
    
    const formattedAddress = place.formatted_address;
    const location = {
      address: formattedAddress,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng()
    };
    
    setInputValue(formattedAddress);
    
    if (onChange) {
      onChange(formattedAddress);
    }
    
    if (onSelect) {
      onSelect(location);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // Handle clear button click
  const handleClear = () => {
    setInputValue('');
    
    if (onChange) {
      onChange('');
    }
    
    if (onClear) {
      onClear();
    }
    
    inputRef.current.focus();
  };
  
  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }
    
    setGettingCurrentLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLoading(true);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get address from coordinates
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const formattedAddress = data.results[0].formatted_address;
            setInputValue(formattedAddress);
            
            if (onChange) {
              onChange(formattedAddress);
            }
            
            if (onSelect) {
              onSelect({
                address: formattedAddress,
                latitude: lat,
                longitude: lng
              });
            }
          }
        } catch (error) {
          console.error('Error getting address from coordinates:', error);
        } finally {
          setLoading(false);
          setGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        setGettingCurrentLocation(false);
      }
    );
  };
  
  return (
    <Form.Group className={className}>
      {label && (
        <Form.Label htmlFor={id}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      
      <InputGroup hasValidation>
        <InputGroup.Text>
          {icon}
        </InputGroup.Text>
        
        <Form.Control
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          required={required}
          disabled={disabled || loading || gettingCurrentLocation}
          isInvalid={!!error}
          autoComplete="off"
        />
        
        {loading && (
          <InputGroup.Text>
            <Spinner animation="border" size="sm" />
          </InputGroup.Text>
        )}
        
        {inputValue && allowClear && !loading && !gettingCurrentLocation && (
          <Button 
            variant="outline-secondary" 
            onClick={handleClear}
            aria-label="Clear"
          >
            <FaTimes />
          </Button>
        )}
        
        {showCurrentLocation && !gettingCurrentLocation && (
          <Button 
            variant="outline-primary" 
            onClick={getCurrentLocation}
            disabled={loading || gettingCurrentLocation}
            aria-label="Use current location"
          >
            <FaLocationArrow />
          </Button>
        )}
        
        {gettingCurrentLocation && (
          <Button 
            variant="outline-primary" 
            disabled
          >
            <Spinner animation="border" size="sm" className="me-1" />
            <span className="visually-hidden">Getting location...</span>
          </Button>
        )}
        
        {error && (
          <Form.Control.Feedback type="invalid">
            {error}
          </Form.Control.Feedback>
        )}
      </InputGroup>
      
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

LocationAutocomplete.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onClear: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.node,
  showCurrentLocation: PropTypes.bool,
  useGoogleMapsLoader: PropTypes.bool,
  allowClear: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.node,
  apiKey: PropTypes.string,
};

export default LocationAutocomplete;