import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
<<<<<<< HEAD
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaLocationArrow, FaRoute } from 'react-icons/fa';
=======
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaLocationArrow, FaRoute } from 'react-icons/fa';
import GoogleMapsSingleton from '../../utils/googleMapsSingleton';
import { getGoogleMapsApiKey } from '../../utils/mapUtils';
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080

/**
 * MapComponent - A reusable Google Maps component
 * 
 * Can be used for displaying routes, selecting locations, and viewing ride details
 */
const MapComponent = ({
<<<<<<< HEAD
  apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
=======
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
  height = '400px',
  width = '100%',
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 12,
  markers = [],
  showDirections = false,
  origin = null,
  destination = null,
  waypoints = [],
  onMarkerClick = null,
  onMapClick = null,
  showCurrentLocation = false,
  fullscreenControl = true,
  zoomControl = true,
  streetViewControl = false,
  mapTypeControl = false,
}) => {
<<<<<<< HEAD
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });
=======
  // Use our custom singleton loader
  const [isLoaded, setIsLoaded] = useState(GoogleMapsSingleton.isLoaded());
  const [loadError, setLoadError] = useState(null);
  
  // Load Google Maps
  useEffect(() => {
    if (!isLoaded) {
      // Initialize with API key first
      const { apiKey, isValid } = getGoogleMapsApiKey();
      
      if (!isValid) {
        setLoadError(new Error('Google Maps API key is missing or invalid'));
        return;
      }
      
      // Initialize the singleton with the API key
      GoogleMapsSingleton.init(apiKey);
      
      // Load Google Maps
      GoogleMapsSingleton.load()
        .then(() => {
          console.log('MapComponent - Google Maps loaded successfully');
          setIsLoaded(true);
        })
        .catch(error => {
          console.error('MapComponent - Error loading Google Maps:', error);
          setLoadError(error);
        });
    }
  }, [isLoaded]);
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080

  // State
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsError, setDirectionsError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // Center map on current location if requested
          if (mapInstance) {
            mapInstance.panTo(location);
            mapInstance.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, [mapInstance]);

  // Get current location on mount if requested
  useEffect(() => {
    if (showCurrentLocation) {
      getCurrentLocation();
    }
  }, [showCurrentLocation, getCurrentLocation]);

  // Calculate directions when origin and destination change
  useEffect(() => {
    if (isLoaded && showDirections && origin && destination) {
      const directionsService = new window.google.maps.DirectionsService();

      // Prepare waypoints if any
      const waypointsArray = waypoints.map(waypoint => ({
        location: waypoint,
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints: waypointsArray,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            setDirectionsError(null);
          } else {
            console.error('Directions request failed:', status);
            setDirectionsError('Could not calculate route. Please check the addresses and try again.');
          }
        }
      );
    }
  }, [isLoaded, showDirections, origin, destination, waypoints]);

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  // Handle map click
  const handleMapClick = (event) => {
    if (onMapClick) {
      onMapClick({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  // Handle map load
  const handleMapLoad = (map) => {
    setMapInstance(map);
  };

  // If API is still loading
  if (!isLoaded) {
    return (
      <div 
        style={{ 
          height, 
          width, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '0.375rem'
        }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2 text-muted">Loading map...</p>
        </div>
      </div>
    );
  }

  // If API failed to load
  if (loadError) {
    return (
      <div 
        style={{ 
          height, 
          width, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '0.375rem'
        }}
      >
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Map Error</Alert.Heading>
          <p>Failed to load Google Maps. Please check your internet connection and try again.</p>
          <p className="mb-0">Error: {loadError.message}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ height, width, position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        options={{
          fullscreenControl,
          zoomControl,
          streetViewControl,
          mapTypeControl,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
        }}
      >
        {/* Directions */}
        {showDirections && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#0d6efd',
                strokeWeight: 5,
              },
              suppressMarkers: markers.length > 0, // Don't show default markers if we have custom ones
            }}
          />
        )}

        {/* Custom Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || `marker-${index}`}
            position={marker.position}
            title={marker.title}
            icon={marker.icon || {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: marker.color || '#0d6efd',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 8,
            }}
            label={marker.label ? {
              text: marker.label,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            } : null}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#0d6efd',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 10,
            }}
            title="Your current location"
          />
        )}

        {/* Selected Marker Info Window */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '5px', maxWidth: '200px' }}>
              {selectedMarker.title && <h6 className="mb-1">{selectedMarker.title}</h6>}
              {selectedMarker.description && <p className="mb-1 small">{selectedMarker.description}</p>}
              {selectedMarker.content}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Current Location Button */}
      {showCurrentLocation && (
        <Button
          variant="light"
          size="sm"
          onClick={getCurrentLocation}
          className="position-absolute m-2 shadow-sm"
          style={{ bottom: '10px', right: '10px', zIndex: 5 }}
        >
          <FaLocationArrow />
        </Button>
      )}

      {/* Directions Error */}
      {directionsError && (
        <Alert 
          variant="warning" 
          className="position-absolute m-2" 
          style={{ top: '10px', left: '10px', right: '10px', zIndex: 5 }}
          dismissible
          onClose={() => setDirectionsError(null)}
        >
          <div className="d-flex align-items-center">
            <FaRoute className="me-2" />
            <span>{directionsError}</span>
          </div>
        </Alert>
      )}
    </div>
  );
};

MapComponent.propTypes = {
  apiKey: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  zoom: PropTypes.number,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      position: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      icon: PropTypes.any,
      color: PropTypes.string,
      label: PropTypes.string,
      content: PropTypes.node,
    })
  ),
  showDirections: PropTypes.bool,
  origin: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  destination: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  waypoints: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    })
  ),
  onMarkerClick: PropTypes.func,
  onMapClick: PropTypes.func,
  showCurrentLocation: PropTypes.bool,
  fullscreenControl: PropTypes.bool,
  zoomControl: PropTypes.bool,
  streetViewControl: PropTypes.bool,
  mapTypeControl: PropTypes.bool,
};

<<<<<<< HEAD
export default MapComponent;
=======
export default MapComponent;
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
