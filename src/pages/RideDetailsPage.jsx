import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Alert, 
  Spinner,
  Modal,
  Form,
  ListGroup,
  Tab,
  Nav
} from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave, 
  FaInfoCircle,
  FaCar,
  FaPhoneAlt,
  FaEnvelope,
  FaStar,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaRoute,
  FaComment,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your-default-api-key';

// Libraries for Google Maps
const libraries = ['places'];

const RideDetailsPage = () => {
  const { rideId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    getRideDetails, 
    acceptRideRequest,
    startRide,
    completeRide,
    cancelRide,
    submitRating,
    sendRideRequest, // Import the new function
    loading: rideLoading, 
    error: rideError 
  } = useRide();
  
  // Page states
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.success ? "Operation successful!" : "");
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  // Fetch ride details
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        const result = await getRideDetails(rideId);
        if (result.success) {
          setRide(result.data);
          if (isLoaded && result.data.pickupLocation && result.data.dropoffLocation) {
            calculateRoute(result.data);
          }
        } else {
          setError('Failed to load ride details');
        }
      } catch (err) {
        setError('An error occurred while fetching ride details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRideDetails();
  }, [rideId, getRideDetails, isLoaded]);
  
  // Calculate and display route on map
  const calculateRoute = (rideData) => {
    if (!window.google || !rideData) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    
    const origin = {
      lat: rideData.pickupLocation.latitude,
      lng: rideData.pickupLocation.longitude
    };
    
    const destination = {
      lat: rideData.dropoffLocation.latitude,
      lng: rideData.dropoffLocation.longitude
    };
    
    // Convert waypoints if any
    const waypoints = (rideData.waypoints || []).map(waypoint => ({
      location: { lat: waypoint.latitude, lng: waypoint.longitude },
      stopover: true
    }));
    
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };
  
  // Handle ride status change
  const handleStatusChange = async (action, data = {}) => {
    setError('');
    setLoading(true);
    
    try {
      let result;
      
      switch (action) {
        case 'accept':
          result = await acceptRideRequest(rideId);
          break;
        case 'start':
          result = await startRide(rideId);
          break;
        case 'complete':
          result = await completeRide(rideId);
          break;
        case 'cancel':
          result = await cancelRide(rideId, data.reason);
          break;
        case 'rate':
          result = await submitRating(rideId, {
            rating: data.rating,
            comment: data.comment
          });
          break;
        default:
          throw new Error('Invalid action');
      }
      
      if (result.success) {
        setRide(result.data);
        setSuccessMessage(`Ride successfully ${action}ed!`);
        
        // Close modals if open
        setShowCancelModal(false);
        setShowRatingModal(false);
        
        // Reset form fields
        setCancelReason('');
        
        // If the ride was rated, navigate to ride history
        if (action === 'rate') {
          navigate('/ride-history', { state: { success: true } });
        }
      } else {
        throw new Error(result.message || `Failed to ${action} ride`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting the ride
  const handleRequestRide = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await sendRideRequest(rideId);
      if (result.success) {
        setSuccessMessage('Ride requested successfully! The driver will review your request.');
        // Optionally, update the ride state locally or re-fetch details
        // For now, just show success message. The button should disappear based on updated state if re-fetched.
        // Consider disabling the button immediately after successful request
      } else {
        throw new Error(result.message || 'Failed to send ride request');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine if the current user is the driver
  const isDriver = ride && currentUser && ride.driver && ride.driver.id === currentUser.id;
  
  // Determine if the current user is the rider
  const isRider = ride && currentUser && ride.rider && ride.rider.id === currentUser.id;
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'accepted':
        return <Badge bg="info">Accepted</Badge>;
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timeString) => {
    return timeString;
  };
  
  // If loading
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ride details...</p>
      </Container>
    );
  }
  
  // If error
  if (error || rideError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || rideError}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
  
  // If ride not found
  if (!ride) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Ride not found or you don't have permission to view this ride.
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Success Message */}
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccessMessage('')}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ride Details</h2>
        <div>
          {getStatusBadge(ride.status)}
        </div>
      </div>
      
      <Row>
        <Col lg={8} className="mb-4 mb-lg-0">
          <Tab.Container defaultActiveKey="details">
            <Card className="shadow-sm">
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="details">Ride Information</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="route">Route Map</Nav.Link>
                  </Nav.Item>
                  {ride.status === 'completed' && (
                    <Nav.Item>
                      <Nav.Link eventKey="feedback">Feedback</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              
              <Card.Body>
                <Tab.Content>
                  {/* Details Tab */}
                  <Tab.Pane eventKey="details">
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaMapMarkerAlt className="text-primary me-2" />
                            Pickup Location
                          </h5>
                          <p className="mb-0">{ride.pickupLocation.address}</p>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaMapMarkerAlt className="text-danger me-2" />
                            Dropoff Location
                          </h5>
                          <p className="mb-0">{ride.dropoffLocation.address}</p>
                        </div>
                        
                        {ride.waypoints && ride.waypoints.length > 0 && (
                          <div className="mb-3">
                            <h5 className="mb-2">
                              <FaRoute className="text-success me-2" />
                              Stops
                            </h5>
                            <ListGroup variant="flush">
                              {ride.waypoints.map((waypoint, index) => (
                                <ListGroup.Item key={index}>
                                  {waypoint.address}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                        )}
                      </Col>
                      
                      <Col md={6}>
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaCalendarAlt className="text-primary me-2" />
                            Date
                          </h5>
                          <p className="mb-0">{formatDate(ride.departureDate)}</p>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaClock className="text-primary me-2" />
                            Time
                          </h5>
                          <p className="mb-0">{formatTime(ride.departureTime)}</p>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaMoneyBillWave className="text-success me-2" />
                            {isDriver ? 'Price per Seat' : 'Price'}
                          </h5>
                          <p className="mb-0">${ride.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="mb-2">
                            <FaUserFriends className="text-primary me-2" />
                            {isDriver ? 'Max Passengers' : 'Passengers'}
                          </h5>
                          <p className="mb-0">{ride.passengers}</p>
                        </div>
                      </Col>
                    </Row>
                    
                    {ride.notes && (
                      <div className="mb-4">
                        <h5 className="mb-2">
                          <FaInfoCircle className="text-primary me-2" />
                          Additional Notes
                        </h5>
                        <Card className="bg-light">
                          <Card.Body>
                            <p className="mb-0">{ride.notes}</p>
                          </Card.Body>
                        </Card>
                      </div>
                    )}
                    
                    {isDriver && ride.status === 'in_progress' && (
                      <Alert variant="info">
                        <div className="d-flex align-items-center">
                          <FaInfoCircle className="me-2" size={20} />
                          <div>
                            <p className="mb-0">
                              Ride in progress. When you've reached the destination, please 
                              complete the ride.
                            </p>
                          </div>
                        </div>
                      </Alert>
                    )}
                    
                    {isRider && ride.status === 'in_progress' && (
                      <Alert variant="info">
                        <div className="d-flex align-items-center">
                          <FaInfoCircle className="me-2" size={20} />
                          <div>
                            <p className="mb-0">
                              Your ride is in progress. The driver will mark the ride as complete 
                              when you reach your destination.
                            </p>
                          </div>
                        </div>
                      </Alert>
                    )}
                    
                    {ride.status === 'cancelled' && (
                      <Alert variant="warning">
                        <div className="d-flex align-items-center">
                          <FaExclamationTriangle className="me-2" size={20} />
                          <div>
                            <p className="mb-0">
                              <strong>Cancellation Reason:</strong> {ride.cancelReason || 'No reason provided'}
                            </p>
                          </div>
                        </div>
                      </Alert>
                    )}
                  </Tab.Pane>
                  
                  {/* Route Map Tab */}
                  <Tab.Pane eventKey="route">
                    {isLoaded ? (
                      <div className="map-container" style={{ height: '500px', width: '100%' }}>
                        <GoogleMap
                          mapContainerStyle={{ height: '100%', width: '100%' }}
                          center={{
                            lat: ride.pickupLocation.latitude,
                            lng: ride.pickupLocation.longitude
                          }}
                          zoom={12}
                          options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                          }}
                        >
                          {/* Pickup Marker */}
                          <Marker
                            position={{
                              lat: ride.pickupLocation.latitude,
                              lng: ride.pickupLocation.longitude
                            }}
                            label={{ text: 'A', color: 'white' }}
                          />
                          
                          {/* Waypoint Markers */}
                          {ride.waypoints && ride.waypoints.map((waypoint, index) => (
                            <Marker
                              key={index}
                              position={{
                                lat: waypoint.latitude,
                                lng: waypoint.longitude
                              }}
                              label={{ 
                                text: String.fromCharCode(66 + index), 
                                color: 'white' 
                              }}
                            />
                          ))}
                          
                          {/* Dropoff Marker */}
                          <Marker
                            position={{
                              lat: ride.dropoffLocation.latitude,
                              lng: ride.dropoffLocation.longitude
                            }}
                            label={{ 
                              text: String.fromCharCode(
                                66 + (ride.waypoints ? ride.waypoints.length : 0)
                              ), 
                              color: 'white' 
                            }}
                          />
                          
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
                    
                    <div className="mt-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Distance:</strong> {ride.distance}
                        </div>
                        <div>
                          <strong>Duration:</strong> {ride.duration}
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                  
                  {/* Feedback Tab */}
                  {ride.status === 'completed' && (
                    <Tab.Pane eventKey="feedback">
                      {ride.rating ? (
                        <div>
                          <div className="mb-3">
                            <h5 className="mb-2">Rating</h5>
                            <div className="d-flex align-items-center">
                              {[...Array(5)].map((_, index) => (
                                <FaStar 
                                  key={index}
                                  className={index < ride.rating ? "text-warning" : "text-muted"}
                                  size={24}
                                />
                              ))}
                              <span className="ms-2">{ride.rating}/5</span>
                            </div>
                          </div>
                          
                          {ride.ratingComment && (
                            <div className="mb-3">
                              <h5 className="mb-2">Comment</h5>
                              <Card className="bg-light">
                                <Card.Body>
                                  <p className="mb-0">{ride.ratingComment}</p>
                                </Card.Body>
                              </Card>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FaStar size={48} className="text-muted mb-3" />
                          <h5>No Rating Yet</h5>
                          <p className="text-muted">
                            {isRider ? 
                              "You haven't rated this ride yet. Please provide your feedback!" : 
                              "This ride hasn't been rated yet."
                            }
                          </p>
                          
                          {isRider && (
                            <Button 
                              variant="primary" 
                              onClick={() => setShowRatingModal(true)}
                            >
                              Rate this Ride
                            </Button>
                          )}
                        </div>
                      )}
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>
              
              <Card.Footer>
                <div className="d-flex flex-wrap gap-2 justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                  
                  <div className="d-flex gap-2">
                    {/* Action buttons based on role and ride status */}
                    {isDriver && ride.status === 'pending' && (
                      <Button 
                        variant="success"
                        onClick={() => handleStatusChange('accept')}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Accept Request
                      </Button>
                    )}

                    {isDriver && ride.status === 'accepted' && (
                      <Button
                        variant="primary"
                        onClick={() => handleStatusChange('start')}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Start Ride
                      </Button>
                    )}

                    {isDriver && ride.status === 'in_progress' && (
                      <Button
                        variant="success"
                        onClick={() => handleStatusChange('complete')}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Complete Ride
                      </Button>
                    )}

                    {isRider && ride.status === 'completed' && !ride.rating && (
                      <Button
                        variant="primary"
                        onClick={() => setShowRatingModal(true)}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Rate this Ride
                      </Button>
                    )}
                    
                    {/* Cancel button for pending or accepted rides */}
                    {(isDriver || isRider) && 
                     (ride.status === 'pending' || ride.status === 'accepted') && (
                      <Button
                        variant="outline-danger"
                        onClick={() => setShowCancelModal(true)}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Cancel Ride
                      </Button>
                    )}

                    {/* Contact button for accepted or in_progress rides */}
                    {(isDriver || isRider) &&
                     (ride.status === 'accepted' || ride.status === 'in_progress') && (
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowContactModal(true)}
                        disabled={loading || rideLoading || !ride} // Add !ride check
                      >
                        Contact {isDriver ? 'Passenger' : 'Driver'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Tab.Container>
        </Col>
        
        {/* Sidebar with user information */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">
                {isDriver ? 'Passenger' : 'Driver'} Information
              </h4>
              
              <div className="d-flex align-items-center mb-3">
                {(isDriver ? ride.rider : ride.driver)?.profilePicture ? (
                  <img 
                    src={(isDriver ? ride.rider : ride.driver).profilePicture} 
                    alt="Profile" 
                    className="rounded-circle me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <FaUser className="text-white" size={24} />
                  </div>
                )}
                
                <div>
                  <h5 className="mb-1">
                    {(isDriver ? ride.rider : ride.driver)?.name || 'User'}
                  </h5>
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" />
                    <span>
                      {(isDriver ? ride.rider : ride.driver)?.rating?.toFixed(1) || 'N/A'} 
                      ({(isDriver ? ride.rider : ride.driver)?.ratingCount || 0} ratings)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Vehicle details if showing driver */}
              {!isDriver && ride.vehicle && (
                <div className="mb-3">
                  <h5 className="border-bottom pb-2 mb-2">Vehicle</h5>
                  <p className="mb-1">
                    <FaCar className="me-2 text-secondary" />
                    <strong>Model:</strong> {ride.vehicle.model}
                  </p>
                  <p className="mb-1">
                    <strong>Color:</strong> {ride.vehicle.color}
                  </p>
                  <p className="mb-0">
                    <strong>License Plate:</strong> {ride.vehicle.licensePlate}
                  </p>
                </div>
              )}
              
              {/* Contact information if ride is accepted or in progress */}
              {(ride.status === 'accepted' || ride.status === 'in_progress') && (
                <div>
                  <h5 className="border-bottom pb-2 mb-2">Contact</h5>
                  <Button 
                    variant="outline-secondary" 
                    className="d-flex align-items-center w-100 mb-2"
                    href={`tel:${(isDriver ? ride.rider : ride.driver)?.phone || ''}`}
                  >
                    <FaPhoneAlt className="me-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className="d-flex align-items-center w-100"
                    href={`mailto:${(isDriver ? ride.rider : ride.driver)?.email || ''}`}
                  >
                    <FaEnvelope className="me-2" />
                    Email
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Tips and reminders card */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Tips & Reminders</h5>
              
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 border-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaCheckCircle className="text-success" size={20} />
                    </div>
                    <div>
                      <strong>Be on time</strong>
                      <p className="mb-0 text-muted small">
                        Arrive at the pickup location a few minutes early.
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 border-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaCheckCircle className="text-success" size={20} />
                    </div>
                    <div>
                      <strong>Communicate clearly</strong>
                      <p className="mb-0 text-muted small">
                        Keep your phone handy and notify about any changes or delays.
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 border-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaCheckCircle className="text-success" size={20} />
                    </div>
                    <div>
                      <strong>Be respectful</strong>
                      <p className="mb-0 text-muted small">
                        Remember you're sharing a ride with community members.
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 border-0">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaTimesCircle className="text-danger" size={20} />
                    </div>
                    <div>
                      <strong>Avoid cancellations</strong>
                      <p className="mb-0 text-muted small">
                        Only cancel if absolutely necessary, and provide notice.
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Add Request Button Logic Here --- */}
      {currentUser && !isDriver && !isRider && ride && ride.status === 'pending' && (ride.passengers < ride.maxPassengers) && (
        <div className="text-end mt-4"> {/* Position it */}
          <Button
            variant="success"
            size="lg"
            onClick={handleRequestRide}
            disabled={loading || rideLoading || !ride} // Disable while loading or if ride data is missing
          >
            {loading || rideLoading ? 'Loading...' : 'Request This Ride'}
          </Button>
        </div>
      )}
      
      {/* Cancel Ride Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Ride</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this ride? This action cannot be undone.</p>
          <Form.Group className="mb-3">
            <Form.Label>Reason for cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button 
            variant="danger"
            onClick={() => handleStatusChange('cancel', { reason: cancelReason })}
            disabled={!cancelReason.trim() || loading || rideLoading || !ride} // Add !ride check
          >
            {(loading || rideLoading) ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rate Your Ride</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h5 className="mb-3">How was your experience?</h5>
            <div className="d-flex justify-content-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={36}
                  className={star <= rating ? "text-warning" : "text-muted"}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <p className="mt-2 mb-0">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label>Additional Comments (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your experience"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={() => handleStatusChange('rate', { rating, comment: ratingComment })}
            disabled={loading || rideLoading || !ride} // Add !ride check
          >
            {(loading || rideLoading) ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Contact {isDriver ? 'Passenger' : 'Driver'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center mb-4">
            {(isDriver ? ride.rider : ride.driver)?.profilePicture ? (
              <img 
                src={(isDriver ? ride.rider : ride.driver).profilePicture} 
                alt="Profile" 
                className="rounded-circle me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                style={{ width: '60px', height: '60px' }}
              >
                <FaUser className="text-white" size={24} />
              </div>
            )}
            
            <div>
              <h5 className="mb-1">
                {(isDriver ? ride.rider : ride.driver)?.name || 'User'}
              </h5>
              <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" />
                <span>
                  {(isDriver ? ride.rider : ride.driver)?.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                <FaPhoneAlt className="text-primary" size={20} />
              </div>
              <div>
                <p className="mb-0">
                  {(isDriver ? ride.rider : ride.driver)?.phone || 'No phone number available'}
                </p>
              </div>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FaEnvelope className="text-primary" size={20} />
              </div>
              <div>
                <p className="mb-0">
                  {(isDriver ? ride.rider : ride.driver)?.email || 'No email available'}
                </p>
              </div>
            </div>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label>Send a Message</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Type your message here..."
              />
              <Button variant="primary">
                <FaComment className="me-2" />
                Send
              </Button>
            </div>
            <Form.Text className="text-muted">
              This feature is for demonstration purposes only.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RideDetailsPage;
