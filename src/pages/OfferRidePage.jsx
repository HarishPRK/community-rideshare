import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave,
  FaInfoCircle,
  FaCar,
  FaRoute,
  FaExclamationTriangle // Added for missing vehicle warning
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import GoogleMapsSingleton from '../utils/googleMapsSingleton';
import { getGoogleMapsApiKey } from '../utils/mapUtils';

// Removed unused pre-defined rideData variable

const OfferRidePage = () => {
  // Basic error states
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initError, setInitError] = useState(false);
  
  // Call all hooks at the top level unconditionally
  const rideContext = useRide();
  const authContext = useAuth();
  const navigate = useNavigate();

  // Destructure hook results safely
  const { offerRide, loading: rideLoading, error: rideError } = rideContext || {};
  // Get currentUser from auth context (removed unused refreshUserProfile)
  const { currentUser } = authContext || {}; 
  
  // Google Maps state
  const [isLoaded, setIsLoaded] = useState(GoogleMapsSingleton.isLoaded());
  const [loadError, setLoadError] = useState(null);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!isLoaded) {
      // Get API key
      const { apiKey, isValid } = getGoogleMapsApiKey();
      
      if (!isValid) {
        setLoadError(new Error('Google Maps API key is missing or invalid'));
        return;
      }
      
      // Initialize and load Maps API
      GoogleMapsSingleton.init(apiKey);
      GoogleMapsSingleton.load()
        .then(() => {
          console.log('OfferRidePage: Google Maps loaded successfully');
          setIsLoaded(true);
        })
        .catch(error => {
          console.error('OfferRidePage: Failed to load Google Maps:', error);
          setLoadError(error);
        });
    }
  }, [isLoaded]);

  // Form state
  const [formData, setFormData] = useState({
    pickupLocation: '',
    pickupCoordinates: null,
    dropoffLocation: '',
    dropoffCoordinates: null,
    date: '',
    time: '',
    maxPassengers: 3,
    pricePerSeat: '',
    allowDetours: false,
    notes: '',
  });
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [showAddWaypoint, setShowAddWaypoint] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState('');
  const [currentWaypointCoords, setCurrentWaypointCoords] = useState(null);
  
  // Error boundary effect - runs after hooks are properly initialized
  useEffect(() => {
    const handleErrors = () => {
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes("Cannot access 'rideData'")) {
          event.preventDefault();
          setInitError(true);
          return true;
        }
        return false;
      });
    };
    
    try {
      handleErrors();
    } catch (error) {
      console.error("Error in error handler setup:", error);
      setHasError(true);
      setErrorMessage(error.message || "Failed to initialize component");
    }
    
    return () => {
      // Clean up the error handler if needed
      window.removeEventListener('error', () => {});
    };
  }, []);

  // Calculate route with all waypoints
  const calculateRoute = useCallback(() => {
    if (!window.google) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    
    // Convert waypoints to the format expected by DirectionsService
    const routeWaypoints = waypoints.map(waypoint => ({
      location: waypoint.coordinates,
      stopover: true,
    }));
    
    directionsService.route(
      {
        origin: formData.pickupCoordinates,
        destination: formData.dropoffCoordinates,
        waypoints: routeWaypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Extract distance and duration
          const route = result.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;
          
          route.legs.forEach(leg => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });
          
          // Convert to km and minutes
          const distanceInKm = totalDistance / 1000;
          const durationInMinutes = Math.ceil(totalDuration / 60);
          
          setDistance(`${distanceInKm.toFixed(1)} km`);
          setDuration(`${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m`);
          
          // Calculate suggested price (example: $0.40 per km + $5 base fare)
          const calculatedPrice = (distanceInKm * 0.4) + 5;
          const perSeatPrice = (calculatedPrice / formData.maxPassengers).toFixed(2);
          setSuggestedPrice(perSeatPrice);
          
          // Update form with suggested price if price is empty
          if (!formData.pricePerSeat) {
            setFormData(prev => ({
              ...prev,
              pricePerSeat: perSeatPrice
            }));
          }
        } else {
          setError('Could not calculate route. Please try different locations.');
          setDirections(null);
          setDistance(null);
          setDuration(null);
          setSuggestedPrice(null);
        }
      }
    );
  }, [
    formData.pickupCoordinates, 
    formData.dropoffCoordinates, 
    formData.pricePerSeat, 
    formData.maxPassengers,
    waypoints
  ]);
  
  // Calculate route when locations change
  useEffect(() => {
    if (isLoaded && formData.pickupCoordinates && formData.dropoffCoordinates) {
      calculateRoute();
    }
  }, [isLoaded, formData.pickupCoordinates, formData.dropoffCoordinates, waypoints, calculateRoute]);
  
  // Initialize autocomplete when the component mounts
  useEffect(() => {
    if (isLoaded && window.google) {
      try {
        const initAutocomplete = (inputId, type) => {
          const input = document.getElementById(inputId);
          if (input) {
            try {
              const autocomplete = new window.google.maps.places.Autocomplete(input);
              autocomplete.addListener('place_changed', () => {
                try {
                  const place = autocomplete.getPlace();
                  if (place && place.geometry) {
                    handlePlaceSelect(place, type);
                  }
                } catch (placeError) {
                  console.error('Error getting place details:', placeError);
                }
              });
            } catch (autoCompleteError) {
              console.error(`Error setting up autocomplete for ${inputId}:`, autoCompleteError);
            }
          }
        };
        
        setTimeout(() => {
          // Delay initialization slightly to ensure DOM is fully loaded
          try {
            initAutocomplete('pickup-location', 'pickup');
            initAutocomplete('dropoff-location', 'dropoff');
            if (showAddWaypoint) {
              initAutocomplete('waypoint-location', 'waypoint');
            }
          } catch (err) {
            console.error('Error initializing autocomplete:', err);
            setInitError(true);
          }
        }, 100);
      } catch (err) {
        console.error('Error in autocomplete setup:', err);
        setInitError(true);
      }
    }
  }, [isLoaded, showAddWaypoint]);
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = (place, type) => {
    if (place.geometry && place.geometry.location) {
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      if (type === 'waypoint') {
        setCurrentWaypoint(place.formatted_address);
        setCurrentWaypointCoords(coordinates);
      } else {
        setFormData(prev => ({
          ...prev,
          [`${type}Location`]: place.formatted_address,
          [`${type}Coordinates`]: coordinates,
        }));
      }
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Add waypoint to the route
  const handleAddWaypoint = () => {
    if (currentWaypoint && currentWaypointCoords) {
      setWaypoints([
        ...waypoints,
        { name: currentWaypoint, coordinates: currentWaypointCoords }
      ]);
      setCurrentWaypoint('');
      setCurrentWaypointCoords(null);
      setShowAddWaypoint(false);
    }
  };
  
  // Remove waypoint from the route
  const handleRemoveWaypoint = (index) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.pickupLocation || !formData.dropoffLocation || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields');
      }
      
      if (!formData.pickupCoordinates || !formData.dropoffCoordinates) {
        throw new Error('Please select valid pickup and dropoff locations');
      }
      
      // Get the user's first vehicle from the vehicles array
      const userVehicle = currentUser?.vehicles && currentUser.vehicles.length > 0 ? currentUser.vehicles[0] : null;

      // Check if user has a vehicle registered
      if (!userVehicle?.id) { // Check the extracted vehicle's ID
        throw new Error('Please add a vehicle to your profile before offering a ride.');
      }
      
      // Create ride offer payload - Align with Postman example
      const rideData = {
        vehicleId: userVehicle.id, // Use vehicleId from the extracted vehicle
        pickupLocation: {
          address: formData.pickupLocation,
          latitude: formData.pickupCoordinates.lat,
          longitude: formData.pickupCoordinates.lng,
          // Add city, state, zipCode if needed by backend, otherwise omit
        },
        dropoffLocation: {
          address: formData.dropoffLocation,
          latitude: formData.dropoffCoordinates.lat, // Corrected: use dropoffCoordinates
          longitude: formData.dropoffCoordinates.lng, // Corrected: use dropoffCoordinates
          // Add city, state, zipCode if needed by backend, otherwise omit
        },
        departureDate: formData.date,
        departureTime: formData.time,
        maxPassengers: parseInt(formData.maxPassengers, 10),
        price: parseFloat(formData.pricePerSeat), // Use 'price' key
        notes: formData.notes // Include notes if needed
      };
      
      // Log the actual payload being sent for debugging
      console.log('Sending offer ride payload:', JSON.stringify(rideData, null, 2));
      console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
      
      // Submit ride offer
      const result = await offerRide(rideData);
      
      if (result.success) {
        console.log('Ride creation successful, data:', result.data);
        
        // Navigate to the "My Offered Rides" page with success message
        if (result.data && result.data.id) {
          // If we have a ride ID, highlight it in the list
          navigate('/my-offered-rides', { 
            state: { 
              success: true, 
              message: 'Your ride was offered successfully!',
              highlightId: result.data.id
            } 
          });
        } else {
          // Just show the success message without highlighting any ride
          navigate('/my-offered-rides', { 
            state: { 
              success: true, 
              message: 'Your ride was offered successfully!' 
            } 
          });
        }
      } else {
        throw new Error(result.message || 'Failed to create ride offer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Show error UI for any initialization errors that we caught
  if (hasError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <strong>Initialization Error</strong>
          <p>There was an error loading the page: {errorMessage}</p>
        </Alert>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }

  // If Google Maps hasn't loaded yet
  if (loadError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Error loading Google Maps: {loadError?.message || 'Unknown error'}. Please try again later.
        </Alert>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }

  // Handle the "Cannot access 'rideData' before initialization" error
  if (initError) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <strong>JavaScript Initialization Error</strong>
          <p>There was an error initializing the ride form. This is likely due to a timing issue with component loading.</p>
        </Alert>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Offer a Ride</h2>
      
      <Row>
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Ride Details</h4>
              
              {/* Error message */}
              {(error || rideError) && (
                <Alert variant="danger" className="mb-4">
                  {error || rideError}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {/* Route Section */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Route Information</h5>
                  
                  {/* Pickup Location */}
                  <Form.Group className="mb-3">
                    <Form.Label>Pickup Location (Starting Point)</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaMapMarkerAlt />
                      </span>
                      <Form.Control
                        id="pickup-location"
                        type="text"
                        name="pickupLocation"
                        placeholder="Enter starting address"
                        value={formData.pickupLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  {/* Waypoints */}
                  {waypoints.length > 0 && (
                    <div className="mb-3">
                      <Form.Label>Stops Along the Way</Form.Label>
                      {waypoints.map((waypoint, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaRoute />
                            </span>
                            <Form.Control
                              type="text"
                              value={waypoint.name}
                              readOnly
                            />
                            <Button 
                              variant="outline-danger" 
                              onClick={() => handleRemoveWaypoint(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Waypoint */}
                  {showAddWaypoint ? (
                    <div className="mb-3">
                      <Form.Label>Add a Stop</Form.Label>
                      <div className="input-group mb-2">
                        <span className="input-group-text">
                          <FaRoute />
                        </span>
                        <Form.Control
                          id="waypoint-location"
                          type="text"
                          placeholder="Enter stop address"
                          value={currentWaypoint}
                          onChange={(e) => setCurrentWaypoint(e.target.value)}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={handleAddWaypoint}
                          disabled={!currentWaypoint || !currentWaypointCoords}
                        >
                          Add Stop
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => {
                            setShowAddWaypoint(false);
                            setCurrentWaypoint('');
                            setCurrentWaypointCoords(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowAddWaypoint(true)}
                      >
                        + Add a Stop
                      </Button>
                    </div>
                  )}
                  
                  {/* Dropoff Location */}
                  <Form.Group className="mb-3">
                    <Form.Label>Dropoff Location (Final Destination)</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaMapMarkerAlt />
                      </span>
                      <Form.Control
                        id="dropoff-location"
                        type="text"
                        name="dropoffLocation"
                        placeholder="Enter destination address"
                        value={formData.dropoffLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  <Row>
                    {/* Date */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Departure Date</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaCalendarAlt />
                          </span>
                          <Form.Control
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    
                    {/* Time */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Departure Time</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaClock />
                          </span>
                          <Form.Control
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Detours Option */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="allowDetours"
                      name="allowDetours"
                      label="I'm flexible with my route and can make small detours if needed"
                      checked={formData.allowDetours}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </div>
                
                  {/* Vehicle Section - Removed, vehicle info comes from profile */}
                  {/* Display selected vehicle from profile */}
                  {/* Check currentUser.vehicles[0] instead of currentUser.vehicle */}
                  {(currentUser?.vehicles && currentUser.vehicles.length > 0) ? (
                    <div className="mb-4">
                      <h5 className="border-bottom pb-2 mb-3">Your Vehicle</h5>
                      <Card bg="light" className="p-3">
                        <div className="d-flex align-items-center">
                          <FaCar size={24} className="text-primary me-3" />
                          <div>
                            {/* Access data from currentUser.vehicles[0] */}
                            <div className="fw-bold">{currentUser.vehicles[0].model} ({currentUser.vehicles[0].color})</div>
                            <div className="text-muted small">License Plate: {currentUser.vehicles[0].licensePlate}</div>
                          </div>
                        </div>
                        <Button
                          variant="link" 
                          size="sm" 
                          className="mt-2 text-decoration-none"
                          onClick={() => navigate('/profile', { state: { focusTab: 'vehicle' } })}
                        >
                          Change Vehicle
                        </Button>
                      </Card>
                    </div>
                  ) : (
                    <Alert variant="warning" className="mb-4 d-flex align-items-center">
                      <FaExclamationTriangle className="me-2" />
                      <div>
                        You need to add a vehicle to your profile before you can offer a ride.
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-1 text-decoration-none"
                          onClick={() => navigate('/profile', { state: { focusTab: 'vehicle' } })}
                        >
                          Add Vehicle Now
                        </Button>
                      </div>
                    </Alert>
                  )}
                  
                  {/* Ride Details Section */}
                  <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Ride Offer Details</h5>
                  
                  <Row>
                    {/* Max Passengers */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Maximum Passengers</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaUserFriends />
                          </span>
                          <Form.Control
                            type="number"
                            name="maxPassengers"
                            min="1"
                            max="8"
                            value={formData.maxPassengers}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    
                    {/* Price Per Seat */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          Price Per Seat
                          {suggestedPrice && (
                            <span className="text-muted ms-2">
                              (Suggested: ${suggestedPrice})
                            </span>
                          )}
                        </Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaMoneyBillWave />
                          </span>
                          <Form.Control
                            type="number"
                            name="pricePerSeat"
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            value={formData.pricePerSeat}
                            onChange={handleChange}
                            required
                          />
                          <span className="input-group-text">$</span>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {/* Additional Notes */}
                  <Form.Group className="mb-3">
                    <Form.Label>Additional Notes (Optional)</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaInfoCircle />
                      </span>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        placeholder="Any specific information for passengers (luggage space, pets allowed, etc.)"
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                </div>
                
                {/* Trip details if available */}
                {distance && duration && (
                  <Alert variant="info" className="mb-4">
                    <p className="mb-1">
                      <strong>Estimated Distance:</strong> {distance}
                    </p>
                    <p className="mb-0">
                      <strong>Estimated Travel Time:</strong> {duration}
                    </p>
                  </Alert>
                )}
                
                {/* Submit Button */}
                <Button 
                  variant="primary" 
                  type="submit"
                  className="w-100 py-2"
                  // Update disabled check to use currentUser.vehicles[0]
                  disabled={loading || rideLoading || !(currentUser?.vehicles && currentUser.vehicles.length > 0 && currentUser.vehicles[0].id)} 
                >
                  {(loading || rideLoading) ? (
                    <>
                      <Spinner 
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating Offer...
                    </>
                  ) : (
                    "Offer Ride"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h4 className="mb-3">Route Preview</h4>
              
              {isLoaded ? (
                <div className="map-container" style={{ height: '660px', width: '100%' }}>
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={
                      formData.pickupCoordinates || 
                      { lat: 37.7749, lng: -122.4194 } // Default to San Francisco
                    }
                    zoom={formData.pickupCoordinates && formData.dropoffCoordinates ? 10 : 13}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {/* Pickup Marker */}
                    {formData.pickupCoordinates && (
                      <Marker
                        position={formData.pickupCoordinates}
                        label={{ text: 'A', color: 'white' }}
                      />
                    )}
                    
                    {/* Waypoint Markers */}
                    {waypoints.map((waypoint, index) => (
                      <Marker
                        key={index}
                        position={waypoint.coordinates}
                        label={{ text: String.fromCharCode(66 + index), color: 'white' }}
                      />
                    ))}
                    
                    {/* Dropoff Marker */}
                    {formData.dropoffCoordinates && (
                      <Marker
                        position={formData.dropoffCoordinates}
                        label={{ 
                          text: String.fromCharCode(66 + waypoints.length), 
                          color: 'white' 
                        }}
                      />
                    )}
                    
                    {/* Route Line */}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          polylineOptions: {
                            strokeColor: '#198754', // Bootstrap success color
                            strokeWeight: 5,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '660px' }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OfferRidePage;
