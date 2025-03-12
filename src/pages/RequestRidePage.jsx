import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUserFriends, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your-default-api-key';

// Libraries for Google Maps
const libraries = ['places'];

const RequestRidePage = () => {
  const { requestRide, loading: rideLoading, error: rideError } = useRide();
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
    passengers: 1,
    price: '',
    notes: '',
  });
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  
  // Calculate route and suggested price when both locations are set
  useEffect(() => {
    if (isLoaded && formData.pickupCoordinates && formData.dropoffCoordinates) {
      calculateRoute();
    }
  }, [isLoaded, formData.pickupCoordinates, formData.dropoffCoordinates]);
  
  // Calculate route between pickup and dropoff
  const calculateRoute = useCallback(() => {
    if (!window.google) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: formData.pickupCoordinates,
        destination: formData.dropoffCoordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Extract distance and duration
          const route = result.routes[0];
          const leg = route.legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
          
          // Calculate suggested price (example: $0.50 per km + $5 base fare)
          const distanceValue = leg.distance.value / 1000; // Convert to km
          const calculatedPrice = (distanceValue * 0.5) + 5;
          setSuggestedPrice(calculatedPrice.toFixed(2));
          
          // Update form with suggested price if price is empty
          if (!formData.price) {
            setFormData(prev => ({
              ...prev,
              price: calculatedPrice.toFixed(2)
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
  }, [formData.pickupCoordinates, formData.dropoffCoordinates, formData.price]);
  
  // Handle address search and selection
  const handlePlaceSelect = (place, type) => {
    if (place.geometry && place.geometry.location) {
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      setFormData(prev => ({
        ...prev,
        [`${type}Location`]: place.formatted_address,
        [`${type}Coordinates`]: coordinates,
      }));
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
    }
  }, [isLoaded]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      
      // Create ride request payload
      const rideData = {
        riderId: currentUser.id,
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
        departureDate: formData.date,
        departureTime: formData.time,
        passengers: parseInt(formData.passengers, 10),
        price: parseFloat(formData.price),
        notes: formData.notes,
        distance: distance,
        duration: duration,
      };
      
      // Submit ride request
      const result = await requestRide(rideData);
      
      if (result.success) {
        navigate(`/rides/${result.data.id}`, { state: { success: true } });
      } else {
        throw new Error(result.message || 'Failed to create ride request');
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
      <h2 className="mb-4">Request a Ride</h2>
      
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
                {/* Pickup Location */}
                <Form.Group className="mb-3">
                  <Form.Label>Pickup Location</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaMapMarkerAlt />
                    </span>
                    <Form.Control
                      id="pickup-location"
                      type="text"
                      name="pickupLocation"
                      placeholder="Enter pickup address"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                {/* Dropoff Location */}
                <Form.Group className="mb-3">
                  <Form.Label>Dropoff Location</Form.Label>
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
                      <Form.Label>Date</Form.Label>
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
                      <Form.Label>Time</Form.Label>
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
                
                <Row>
                  {/* Passengers */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Passengers</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUserFriends />
                        </span>
                        <Form.Control
                          type="number"
                          name="passengers"
                          min="1"
                          max="8"
                          value={formData.passengers}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  
                  {/* Price */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        Suggested Price
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
                          name="price"
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                        <span className="input-group-text">$</span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Additional Notes */}
                <Form.Group className="mb-4">
                  <Form.Label>Additional Notes (Optional)</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaInfoCircle />
                    </span>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      placeholder="Any specific requirements or information for the driver"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
                
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
                      Submitting Request...
                    </>
                  ) : (
                    "Request Ride"
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
                <div className="map-container" style={{ height: '500px', width: '100%' }}>
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
                    
                    {/* Dropoff Marker */}
                    {formData.dropoffCoordinates && (
                      <Marker
                        position={formData.dropoffCoordinates}
                        label={{ text: 'B', color: 'white' }}
                      />
                    )}
                    
                    {/* Route Line */}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          polylineOptions: {
                            strokeColor: '#0d6efd',
                            strokeWeight: 5,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
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

export default RequestRidePage;