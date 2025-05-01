<<<<<<< HEAD
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
=======
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
  Spinner,
  Modal,
  Form,
  ListGroup,
  Tab,
  Nav
} from 'react-bootstrap';
<<<<<<< HEAD
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave, 
=======
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaMoneyBillWave,
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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
<<<<<<< HEAD
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your-default-api-key';

// Libraries for Google Maps
const libraries = ['places'];
=======
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import GoogleMapsSingleton from '../utils/googleMapsSingleton';
import { getGoogleMapsApiKey } from '../utils/mapUtils';

// Helper function to get the correct API function from RideContext
const getApiFunction = (context, action) => {
  if (!context) return null;
  switch (action) {
    case 'accept_request': return context.acceptRideRequest;
    case 'reject_request': return context.rejectRideRequest; // Ensure this exists in context
    case 'start': return context.startRide;
    case 'complete': return context.completeRide;
    case 'cancel': return context.cancelRide;
    case 'rate': return context.submitRating;
    case 'request': return context.requestRide;
    default: return null;
  }
};

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080

const RideDetailsPage = () => {
  const { rideId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
<<<<<<< HEAD
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
  
=======
  const rideContext = useRide(); // Get the whole context
  const {
    getRideDetails,
    loading: rideLoading, // Use context loading for initial fetch
    error: rideError // Use context error for initial fetch
  } = rideContext;

  // Page states
  const [ride, setRide] = useState(null);
  const [error, setError] = useState(''); // Local error state for actions
  const [loading, setLoading] = useState(true); // Local loading for initial fetch
  const [actionLoading, setActionLoading] = useState(false); // Separate loading state for actions
  const [directions, setDirections] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.success ? "Operation successful!" : "");

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
<<<<<<< HEAD
  
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
    
=======

  // Google Maps state
  const [isLoaded, setIsLoaded] = useState(GoogleMapsSingleton.isLoaded());
  const [loadError, setLoadError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!isLoaded) {
      const { apiKey, isValid } = getGoogleMapsApiKey();
      if (!isValid) {
        setLoadError(new Error('Google Maps API key is missing or invalid'));
        return;
      }
      GoogleMapsSingleton.init(apiKey);
      GoogleMapsSingleton.load()
        .then(() => {
          console.log('RideDetailsPage: Google Maps loaded successfully');
          setIsLoaded(true);
        })
        .catch(error => {
          console.error('RideDetailsPage: Failed to load Google Maps:', error);
          setLoadError(error);
        });
    }
  }, [isLoaded]);

  // Fetch ride details function (memoized)
  const fetchRideDetails = useCallback(async () => {
    if (!rideId) return;
    if (!getRideDetails) {
        console.error("getRideDetails function not available from context yet.");
        setError("Ride context not fully loaded.");
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      setError('');
      console.log('Fetching ride details for ID:', rideId);
      const result = await getRideDetails(rideId);
      console.log('Ride details result:', result);

      if (result.success) {
        let rideData;
        // Handle potential variations in API response structure
        if (result.ride?.id) {
            rideData = result.ride;
        } else if (result.data?.ride?.id) {
            rideData = result.data.ride;
        } else if (result.data?.id) {
            rideData = result.data;
        } else {
            throw new Error('Invalid ride data format received');
        }

        console.log('Setting ride data:', rideData);
        setRide(rideData);

        if (isLoaded && rideData.pickupLocation && rideData.dropoffLocation) {
          calculateRoute(rideData);
        }
      } else {
        setError(result.message || 'Failed to load ride details');
        setRide(null);
      }
    } catch (err) {
      setError('An error occurred while fetching ride details.');
      console.error('Error in fetchRideDetails:', err);
      setRide(null);
    } finally {
      setLoading(false);
    }
  }, [rideId, getRideDetails, isLoaded]);

  // Fetch ride details on mount or when rideId changes
  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  // Calculate and display route on map
  const calculateRoute = (rideData) => {
    if (!window.google || !rideData || !rideData.pickupLocation || !rideData.dropoffLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    const origin = {
      lat: rideData.pickupLocation.latitude,
      lng: rideData.pickupLocation.longitude
    };
<<<<<<< HEAD
    
=======
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    const destination = {
      lat: rideData.dropoffLocation.latitude,
      lng: rideData.dropoffLocation.longitude
    };
<<<<<<< HEAD
    
    // Convert waypoints if any
=======
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    const waypoints = (rideData.waypoints || []).map(waypoint => ({
      location: { lat: waypoint.latitude, lng: waypoint.longitude },
      stopover: true
    }));
<<<<<<< HEAD
    
=======

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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
<<<<<<< HEAD
  
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
=======

  // Handle ride status change / request / accept/reject
  const handleAction = async (action, data = {}) => {
    setError('');
    setActionLoading(true);
    setSuccessMessage('');

    const apiFunction = getApiFunction(rideContext, action);
    if (!apiFunction) {
        setError(`Action "${action}" is not implemented in context.`);
        setActionLoading(false);
        return;
    }

    try {
      let result;
      let payload;
      let idToUse = rideId;
      let successMsgAction = action.replace('_request', '');

      switch (action) {
        case 'cancel':
          payload = { reason: data.reason };
          idToUse = rideId;
          break;
        case 'rate':
           const targetUserId = isDriver
             ? ride?.requests?.find(r => r.status === 'ACCEPTED')?.passengerId
             : ride?.driver?.id;
           if (!targetUserId) throw new Error("Cannot determine user to rate.");
           payload = { rating: data.rating, comment: data.comment, toUserId: targetUserId };
           idToUse = rideId;
          break;
        case 'request':
          payload = { rideId: rideId, passengerCount: 1 };
          idToUse = null; // requestRide doesn't take ID as first arg
          successMsgAction = 'requested';
          break;
        case 'accept_request':
        case 'reject_request':
          idToUse = data.requestId; // Use request ID
          payload = undefined;
          successMsgAction = action === 'accept_request' ? 'accepted request for' : 'rejected request for';
          break;
        case 'start':
             idToUse = rideId;
             payload = undefined;
             break;
        case 'complete':
             idToUse = rideId;
             payload = undefined;
             break;
        default:
          throw new Error(`Invalid action type: ${action}`);
      }

      console.log(`Performing action: ${action} with ID: ${idToUse}, Payload:`, payload);

      // Call the appropriate function from context
      if (idToUse !== null) {
         result = await apiFunction(idToUse, payload);
      } else {
         result = await apiFunction(payload); // For requestRide
      }

      console.log(`Action ${action} result:`, result);

      if (result.success) {
        // Always re-fetch ride details after any successful action
        console.log(`Action ${action} successful, re-fetching ride details...`);
        await fetchRideDetails(); // Re-fetch to get latest state

        // Customize success message for accept/reject
        if (action === 'accept_request' || action === 'reject_request') {
           // Attempt to find passenger name from the *potentially* updated ride state
           // It's safer to maybe just show a generic success message here after re-fetch
           setSuccessMessage(`Request successfully ${successMsgAction}.`);
        } else {
           setSuccessMessage(`Ride successfully ${successMsgAction}!`);
        }

        setShowCancelModal(false);
        setShowRatingModal(false);
        setCancelReason('');

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
        if (action === 'rate') {
          navigate('/ride-history', { state: { success: true } });
        }
      } else {
        throw new Error(result.message || `Failed to ${action} ride`);
      }
    } catch (err) {
<<<<<<< HEAD
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
=======
      setError(err.message || `An error occurred during action: ${action}`);
      console.error(`Error performing action ${action}:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  // Determine user roles and capabilities
  const isDriver = ride && currentUser && ride.driver && ride.driver.id === currentUser.id;
  const userRideRequest = ride?.requests?.find(req => req.passengerId === currentUser?.id);
  const isRider = !!userRideRequest;
  const canRequest = ride?.status === 'ACTIVE' &&
                     currentUser &&
                     !isDriver &&
                     !isRider &&
                     ride.passengers < ride.maxPassengers;

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <Badge bg="secondary">Active</Badge>;
      case 'PENDING': return <Badge bg="warning">Pending</Badge>;
      case 'ACCEPTED': return <Badge bg="info">Accepted</Badge>;
      case 'IN_PROGRESS': return <Badge bg="primary">In Progress</Badge>;
      case 'COMPLETED': return <Badge bg="success">Completed</Badge>;
      case 'CANCELLED': return <Badge bg="danger">Cancelled</Badge>;
      case 'REJECTED': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Format date (Corrected to handle potential timezone issues from backend DATE type)
  const formatDate = (dateString) => {
    try {
      // dateString should now be a full timestamp string (e.g., 2025-04-17T00:00:00.000Z)
      const date = new Date(dateString); 
      if (isNaN(date.getTime())) return "Invalid Date";

      // Extract UTC components to avoid local timezone shifting the date
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth(); // 0-indexed
      const day = date.getUTCDate();

      // Create a new date object using UTC components but interpreted as local
      // This effectively displays the date as it was intended in UTC
      const displayDate = new Date(year, month, day); 

      return displayDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) { 
      console.error("Error formatting date:", e); // Log error
      return "Invalid Date"; 
    }
  };

  // Format time
  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  // Loading state
  if (loading && !ride) {
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ride details...</p>
      </Container>
    );
  }
<<<<<<< HEAD
  
  // If error
  if (error || rideError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || rideError}
=======

  // Error state
  const displayError = error || rideError;
  if (displayError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {typeof displayError === 'string' ? displayError : 'An unknown error occurred.'}
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
<<<<<<< HEAD
  
  // If ride not found
  if (!ride) {
=======

  // Ride not found state
  if (!ride) {
    if (loading) return null;
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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
<<<<<<< HEAD
  
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
      
=======

  // Main component render
  return (
    <Container className="py-4">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="mb-4">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ride Details</h2>
        <div>{getStatusBadge(ride.status)}</div>
      </div>

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
      <Row>
        <Col lg={8} className="mb-4 mb-lg-0">
          <Tab.Container defaultActiveKey="details">
            <Card className="shadow-sm">
              <Card.Header>
                <Nav variant="tabs">
<<<<<<< HEAD
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
=======
                  <Nav.Item><Nav.Link eventKey="details">Ride Information</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="route">Route Map</Nav.Link></Nav.Item>
                  {ride.status === 'COMPLETED' && (<Nav.Item><Nav.Link eventKey="feedback">Feedback</Nav.Link></Nav.Item>)}
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="details">
                    {/* Display Pending Requests for Driver */}
                    {isDriver && ride.requests && ride.requests.filter(req => req.status === 'PENDING').length > 0 && (
                      <div className="mb-4">
                        <h5 className="mb-2">Pending Requests</h5>
                        <ListGroup>
                          {ride.requests.filter(req => req.status === 'PENDING').map(request => (
                            <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center flex-wrap">
                              <div>
                                <FaUser className="me-2" />
                                {request.passenger?.name || 'Passenger'} ({request.passengerCount || 1} seat(s))
                                {request.note && <div className="text-muted small mt-1">Note: {request.note}</div>}
                              </div>
                              <div className="d-flex gap-2 mt-2 mt-md-0">
                                <Button variant="success" size="sm" onClick={() => handleAction('accept_request', { requestId: request.id })} disabled={actionLoading || rideLoading}>Accept</Button>
                                <Button variant="danger" size="sm" onClick={() => handleAction('reject_request', { requestId: request.id })} disabled={actionLoading || rideLoading}>Reject</Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}

                     <Row className="mb-4">
                      <Col md={6}>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaMapMarkerAlt className="text-primary me-2" />Pickup Location</h5>
                          <p className="mb-0">{ride.pickupLocation?.address || 'N/A'}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaMapMarkerAlt className="text-danger me-2" />Dropoff Location</h5>
                          <p className="mb-0">{ride.dropoffLocation?.address || 'N/A'}</p>
                        </div>
                        {/* Waypoints rendering */}
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaCalendarAlt className="text-primary me-2" />Date</h5>
                          <p className="mb-0">{formatDate(ride.departureDate)}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaClock className="text-primary me-2" />Time</h5>
                          <p className="mb-0">{formatTime(ride.departureTime)}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaMoneyBillWave className="text-success me-2" />{isDriver ? 'Price per Seat' : 'Price'}</h5>
                          <p className="mb-0">${ride.price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="mb-2"><FaUserFriends className="text-primary me-2" />{isDriver ? `Seats: ${ride.passengers}/${ride.maxPassengers}` : `Max Passengers: ${ride.maxPassengers}`}</h5>
                           {!isDriver && <p className="mb-0">Seats Available: {ride.maxPassengers - ride.passengers}</p>}
                        </div>
                      </Col>
                    </Row>
                    {ride.notes && (
                      <div className="mb-4">
                        <h5 className="mb-2"><FaInfoCircle className="text-primary me-2" />Additional Notes</h5>
                        <Card className="bg-light"><Card.Body><p className="mb-0">{ride.notes}</p></Card.Body></Card>
                      </div>
                    )}
                    {/* Status specific alerts */}
                    {isDriver && ride.status === 'IN_PROGRESS' && ( <Alert variant="info">Ride in progress. Complete it upon arrival.</Alert> )}
                    {isRider && ride.status === 'IN_PROGRESS' && ( <Alert variant="info">Ride in progress. Driver will complete it upon arrival.</Alert> )}
                    {ride.status === 'CANCELLED' && ( <Alert variant="warning"><strong>Cancellation Reason:</strong> {ride.cancelReason || 'No reason provided'}</Alert> )}
                    {userRideRequest?.status === 'PENDING' && ( <Alert variant="info">Your request to join this ride is pending driver approval.</Alert> )}
                    {userRideRequest?.status === 'REJECTED' && ( <Alert variant="danger">Your request to join this ride was rejected by the driver.</Alert> )}
                    {userRideRequest?.status === 'CANCELLED' && ( <Alert variant="secondary">You have cancelled your request for this ride.</Alert> )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="route">
                     {isLoaded && ride.pickupLocation && ride.dropoffLocation ? (
                      <div className="map-container" style={{ height: '500px', width: '100%' }}>
                        <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} center={{ lat: ride.pickupLocation.latitude, lng: ride.pickupLocation.longitude }} zoom={12} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}>
                           <Marker position={{ lat: ride.pickupLocation.latitude, lng: ride.pickupLocation.longitude }} label={{ text: 'A', color: 'white' }} />
                           {ride.waypoints && ride.waypoints.map((waypoint, index) => (<Marker key={index} position={{ lat: waypoint.latitude, lng: waypoint.longitude }} label={{ text: String.fromCharCode(66 + index), color: 'white' }} />))}
                           <Marker position={{ lat: ride.dropoffLocation.latitude, lng: ride.dropoffLocation.longitude }} label={{ text: String.fromCharCode(66 + (ride.waypoints ? ride.waypoints.length : 0)), color: 'white' }} />
                           {directions && (<DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#0d6efd', strokeWeight: 5 }, suppressMarkers: true }} />)}
                        </GoogleMap>
                      </div>
                    ) : ( <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}><Spinner animation="border" variant="primary" /></div> )}
                    <div className="mt-3"><div className="d-flex justify-content-between"><div><strong>Distance:</strong> {ride.distance || 'N/A'}</div><div><strong>Duration:</strong> {ride.duration || 'N/A'}</div></div></div>
                  </Tab.Pane>

                  {ride.status === 'COMPLETED' && (
                    <Tab.Pane eventKey="feedback">
                       {ride.rating ? ( /* Rating display */ <div>...</div> ) : ( /* No rating display */ <div>...</div> )}
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>
<<<<<<< HEAD
              
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
=======

              <Card.Footer>
                <div className="d-flex flex-wrap gap-2 justify-content-between">
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
                  <div className="d-flex gap-2">
                    {/* Action Buttons */}
                     {/* Changed condition from 'ACCEPTED' to 'ACTIVE' for starting ride */}
                     {isDriver && ride.status === 'ACTIVE' && ( <Button variant="primary" onClick={() => handleAction('start')} disabled={actionLoading || rideLoading}>Start Ride</Button> )}
                     {isDriver && ride.status === 'IN_PROGRESS' && ( <Button variant="success" onClick={() => handleAction('complete')} disabled={actionLoading || rideLoading}>Complete Ride</Button> )}
                     {isRider && ride.status === 'COMPLETED' && !ride.rating && ( <Button variant="primary" onClick={() => setShowRatingModal(true)}>Rate this Ride</Button> )}
                     {(isDriver || isRider) && (ride.status === 'PENDING' || ride.status === 'ACCEPTED') && ( <Button variant="outline-danger" onClick={() => setShowCancelModal(true)}>Cancel Ride</Button> )}
                     {(isDriver || isRider) && (ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && ( <Button variant="outline-primary" onClick={() => setShowContactModal(true)}>Contact {isDriver ? 'Passenger' : 'Driver'}</Button> )}
                     {canRequest && ( <Button variant="success" onClick={() => handleAction('request')} disabled={actionLoading || rideLoading}>Request This Ride</Button> )}
                    {/* Request Status Badges */}
                    {userRideRequest && userRideRequest.status === 'PENDING' && ( <Badge bg="warning" className="p-2 align-self-center">Request Pending</Badge> )}
                    {userRideRequest && userRideRequest.status === 'ACCEPTED' && ( <Badge bg="info" className="p-2 align-self-center">Ride Booked!</Badge> )}
                    {userRideRequest && userRideRequest.status === 'REJECTED' && ( <Badge bg="danger" className="p-2 align-self-center">Request Rejected</Badge> )}
                    {userRideRequest && userRideRequest.status === 'CANCELLED' && ( <Badge bg="secondary" className="p-2 align-self-center">Request Cancelled</Badge> )}
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Tab.Container>
        </Col>
<<<<<<< HEAD
        
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
=======

        <Col lg={4}>
           {/* Sidebar */}
           <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">{isDriver ? 'Passenger' : 'Driver'} Information</h4>
              {/* Display Driver Info if available */}
              {ride?.driver ? (
                <>
                  <div className="d-flex align-items-center mb-3">
                    {ride.driver.profilePicture ? (
                      <img 
                        src={ride.driver.profilePicture} 
                        alt={ride.driver.name} 
                        className="rounded-circle me-3" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3" 
                        style={{ width: '60px', height: '60px' }}
                      >
                        <FaUser size={24} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h5 className="mb-0">{ride.driver.name}</h5>
                      <div className="d-flex align-items-center text-muted small">
                        <FaStar className="text-warning me-1" />
                        <span>{ride.driver.rating?.toFixed(1) || 'N/A'} ({ride.driver.ratingCount || 0} ratings)</span>
                      </div>
                    </div>
                  </div>
                  {ride.vehicle && (
                    <div>
                      <h6 className="text-muted small mb-1">Vehicle</h6>
                      <div className="d-flex align-items-center">
                        <FaCar className="me-2 text-primary" />
                        <span>{ride.vehicle.color} {ride.vehicle.model}</span>
                      </div>
                      {/* Optionally add license plate if needed */}
                      {/* <div className="text-muted small mt-1">Plate: {ride.vehicle.licensePlate}</div> */}
                    </div>
                  )}
                  {/* Add Contact Button if applicable */}
                  {(ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && !isDriver && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="mt-3 w-100" 
                      onClick={() => setShowContactModal(true)}
                    >
                      Contact Driver
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-muted">Driver details not available.</p>
              )}
            </Card.Body>
          </Card>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Tips & Reminders</h5>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item>
                  <FaComment className="me-2 text-primary" />
                  Communicate clearly with your {isDriver ? 'passenger' : 'driver'} about pickup details and any potential delays.
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaClock className="me-2 text-primary" />
                  Be punctual for the pickup time. Let the other party know if you're running late.
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaCheckCircle className="me-2 text-primary" />
                  Confirm the destination and any specific drop-off instructions before starting the ride.
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaCar className="me-2 text-primary" />
                  Drive safely and adhere to traffic rules. Passengers, wear your seatbelts.
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaStar className="me-2 text-primary" />
                  Remember to rate your {isDriver ? 'passenger' : 'driver'} after the ride is completed to help the community.
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

<<<<<<< HEAD
      {/* --- Add Request Button Logic Here --- */}
      {currentUser && !isDriver && !isRider && ride && ride.status === 'pending' && (ride.passengers < ride.maxPassengers) && (
        <div className="text-end mt-4"> {/* Position it */}
          <Button
            variant="success"
            size="lg"
            onClick={handleRequestRide}
            disabled={loading || rideLoading || !ride} // Disable while loading or if ride data is missing
          >
            {(loading || rideLoading) && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
            Request This Ride
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
            {(loading || rideLoading) && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
            Confirm Cancellation
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
            {(loading || rideLoading) && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
            Submit Rating
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
=======
      {/* Modals */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered> {/* ... Cancel Modal ... */} </Modal>
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered> {/* ... Rating Modal ... */} </Modal>
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered> {/* ... Contact Modal ... */} </Modal>

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    </Container>
  );
};

export default RideDetailsPage;
