import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave, 
  FaInfoCircle,
  FaCar,
  FaRoute
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your-default-api-key';

// Libraries for Google Maps
const libraries = ['places'];

const OfferRidePage = () => {
  const { offerRide, loading: rideLoading, error: rideError } = useRide();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  // State for the form
  const [formData, setFormData] = useState({
    pickupLocation: '',
    pickupCoordinates: null,
    dropoffLocation: '',
    dropoffCoordinates: null,
    date: '',
    time: '',
    maxPassengers: 3,
    pricePerSeat: '',
    vehicleModel: '',
    vehicleColor: '',
    licensePlate: '',
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
  
  // Calculate route when locations change
  useEffect(() => {
    if (isLoaded && formData.pickupCoordinates && formData.dropoffCoordinates) {
      calculateRoute();
    }
  }, [isLoaded, formData.pickupCoordinates, formData.dropoffCoordinates, waypoints]);
  
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
  
  // Initialize autocomplete when the component mounts
  useEffect(() => {
    if (isLoaded && window.google) {
      const initAutocomplete = (inputId, type) => {
        const input = document.getElementById(inputId);
        if (input) {
          const autocomplete = new window.google.maps.places.Autocomplete(input);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            handlePlaceSelect(place, type);
          });
        }
      };
      
      initAutocomplete('pickup-location', 'pickup');
      initAutocomplete('dropoff-location', 'dropoff');
      initAutocomplete('waypoint-location', 'waypoint');
    }
  }, [isLoaded, showAddWaypoint]);
  
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
      
      if (!formData.vehicleModel || !formData.vehicleColor || !formData.licensePlate) {
        throw new Error('Please provide your vehicle details');
      }
      
      // Create ride offer payload
      const rideData = {
        driverId: currentUser.id,
        pickupLocation: {
          address: formData.pickupLocation,
          latitude: formData.pickupCoordinates.lat,
          longitude: formData.pickupCoordinates.lng,
        },
        dropoffLocation: {
          address: formData.dropoffLocation,
          latitude: formData.dropoffCoordinates.lat,
          longitude: formData.dropoffCoordinates.lng,
        },
        waypoints: waypoints.map(waypoint => ({
          address: waypoint.name,
          latitude: waypoint.coordinates.lat,
          longitude: waypoint.coordinates.lng
        })),
        departureDate: formData.date,
        departureTime: formData.time,
        maxPassengers: parseInt(formData.maxPassengers, 10),
        pricePerSeat: parseFloat(formData.pricePerSeat),
        vehicle: {
          model: formData.vehicleModel,
          color: formData.vehicleColor,
          licensePlate: formData.licensePlate,
        },
        allowDetours: formData.allowDetours,
        notes: formData.notes,
        distance: distance,
        duration: duration,
      };
      
      // Submit ride offer
      const result = await offerRide(rideData);
      
      if (result.success) {
        navigate(`/rides/${result.data.id}`, { state: { success: true } });
      } else {
        throw new Error(result.message || 'Failed to create ride offer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // If Google Maps hasn't loaded yet
  if (loadError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Error loading maps. Please try again later.
        </Alert>
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
                
                {/* Vehicle Section */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Vehicle Information</h5>
                  
                  {/* Vehicle Model */}
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Model</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaCar />
                      </span>
                      <Form.Control
                        type="text"
                        name="vehicleModel"
                        placeholder="e.g., Toyota Camry, Honda Civic"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                  
                  <Row>
                    {/* Vehicle Color */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Vehicle Color</Form.Label>
                        <Form.Control
                          type="text"
                          name="vehicleColor"
                          placeholder="e.g., Blue, Silver"
                          value={formData.vehicleColor}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    {/* License Plate */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>License Plate</Form.Label>
                        <Form.Control
                          type="text"
                          name="licensePlate"
                          placeholder="e.g., ABC123"
                          value={formData.licensePlate}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                
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
                  disabled={loading || rideLoading}
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