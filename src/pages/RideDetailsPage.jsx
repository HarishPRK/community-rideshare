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
    case 'request_to_join': return context.requestToJoinRide; // Use the function for joining
    // 'request' might be for creating a new ride request elsewhere, not joining this specific one
    // case 'request': return context.requestRide;
    default: return null;
  }
};


const RideDetailsPage = () => {
  const { rideId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const rideContext = useRide(); // Get the whole context
  const {
    getRideDetails,
    loading: rideLoading, // Use context loading for general state
    error: rideError // Use context error for general state
  } = rideContext;

  // Page states
  const [ride, setRide] = useState(null);
  const [error, setError] = useState(''); // Local error state for actions
  const [loading, setLoading] = useState(true); // Local loading for initial fetch
  // Remove general actionLoading state: const [actionLoading, setActionLoading] = useState(false); 
  const [buttonUpdateTrigger, setButtonUpdateTrigger] = useState(0); // State to force button UI updates

  // Button-specific loading states using useRef
  const loadingRef = React.useRef({
    start: false,
    complete: false,
    request_to_join: false,
    accept_request: false,
    reject_request: false,
    cancel: false,
    rate: false
  });
  
  // State getters for each action (these don't trigger re-renders when changed)
  const startRideLoading = loadingRef.current.start;
  const completeRideLoading = loadingRef.current.complete;
  const requestRideLoading = loadingRef.current.request_to_join;
  const acceptRequestLoading = loadingRef.current.accept_request;
  const rejectRequestLoading = loadingRef.current.reject_request;
  const cancelRideLoading = loadingRef.current.cancel;
  // Remove state getters, access ref directly:
  // const startRideLoading = loadingRef.current.start;
  // ... (removed other similar lines) ...
  const [directions, setDirections] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.success ? "Operation successful!" : "");

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

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
    const origin = {
      lat: rideData.pickupLocation.latitude,
      lng: rideData.pickupLocation.longitude
    };
    const destination = {
      lat: rideData.dropoffLocation.latitude,
      lng: rideData.dropoffLocation.longitude
    };
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

  // Helper to update loading ref and trigger re-render for buttons
  const setActionSpecificLoading = (action, isLoading) => {
      loadingRef.current[action] = isLoading;
      setButtonUpdateTrigger(prev => prev + 1); // Force re-render
  };

  // Handle ride status change / request / accept/reject
  const handleAction = async (action, data = {}) => {
    setError('');
    // Remove general actionLoading: setActionLoading(true);
    setSuccessMessage('');
    
    // Set the specific loading state to true
    setActionSpecificLoading(action, true);

    const apiFunction = getApiFunction(rideContext, action);
    if (!apiFunction) {
        setError(`Action "${action}" is not implemented in context.`);
        // Remove general actionLoading: setActionLoading(false);
        setActionSpecificLoading(action, false); // Reset specific loading state
        return;
    }

    try {
      let result;
      let payload;
      let idToUse = rideId; // Default to rideId
      let successMsgAction = action.replace('_request', '').replace('_', ' '); // Format action name for messages

      switch (action) {
        case 'cancel':
          payload = { reason: data.reason };
          idToUse = rideId;
          break;
        case 'rate':
           // Determine who to rate based on current user's role
           const targetUserId = isDriver
             ? ride?.requests?.find(r => r.status === 'ACCEPTED')?.passengerId // Find accepted passenger
             : ride?.driver?.id; // Rate the driver
           if (!targetUserId) throw new Error("Cannot determine user to rate.");
           payload = { rating: data.rating, comment: data.comment, toUserId: targetUserId };
           idToUse = rideId;
          break;
        case 'request_to_join': // Action for the "Request This Ride" button
          idToUse = rideId; // Pass rideId to the context function
          payload = undefined; // No extra payload needed for joining
          successMsgAction = 'requested to join';
          break;
        case 'accept_request':
        case 'reject_request':
          idToUse = data.requestId; // Use request ID for accept/reject
          payload = undefined;
          successMsgAction = action === 'accept_request' ? 'accepted request' : 'rejected request';
          break;
        case 'start':
        case 'complete':
             idToUse = rideId;
             payload = undefined;
             break;
        default:
          throw new Error(`Invalid action type: ${action}`);
      }

      console.log(`Performing action: ${action} with ID: ${idToUse}, Payload:`, payload);

      // Call the appropriate function from context
      result = await apiFunction(idToUse, payload); // Pass ID and payload

      console.log(`Action ${action} result:`, result);

      if (result.success) {
        // Always re-fetch ride details after any successful action
        console.log(`Action ${action} successful, re-fetching ride details...`);
        await fetchRideDetails(); // Re-fetch to get latest state

        setSuccessMessage(`Successfully ${successMsgAction}!`);

        // Close relevant modals
        if (action === 'cancel') setShowCancelModal(false);
        if (action === 'rate') setShowRatingModal(false);

        // Reset form fields
        setCancelReason('');

        // Navigate away if rating was submitted
        if (action === 'rate') {
          navigate('/ride-history', { state: { success: true } });
        }
      } else {
        throw new Error(result.message || `Failed to ${action} ride`);
      }
    } catch (err) {
      setError(err.message || `An error occurred during action: ${action}`);
      console.error(`Error performing action ${action}:`, err);
    } finally {
      // Remove general actionLoading: setActionLoading(false);
      // Reset the specific loading state
      setActionSpecificLoading(action, false);
    }
  };

  // Determine user roles and capabilities
  const isDriver = ride && currentUser && ride.driver && ride.driver.id === currentUser.id;
  // Find the current user's request for *this specific ride*
  const userRideRequest = ride?.requests?.find(req => req.passengerId === currentUser?.id);
  // User is considered a rider if they have an ACCEPTED request for this ride
  const isRider = userRideRequest?.status === 'ACCEPTED';
  // Can request if ride is ACTIVE, user exists, isn't driver, doesn't have *any* request yet, and seats available
  const canRequest = ride?.status === 'ACTIVE' &&
                     currentUser &&
                     !isDriver &&
                     !userRideRequest && // Check if user has *any* request (pending, accepted, etc.)
                     ride.passengers < ride.maxPassengers;

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <Badge bg="secondary">Active</Badge>; // Status when ride is offered but not started
      case 'PENDING': return <Badge bg="warning">Pending</Badge>; // Status for a ride *request*
      case 'ACCEPTED': return <Badge bg="info">Accepted</Badge>; // Status for a ride *request*
      case 'IN_PROGRESS': return <Badge bg="primary">In Progress</Badge>; // Status for the *ride*
      case 'COMPLETED': return <Badge bg="success">Completed</Badge>; // Status for the *ride*
      case 'CANCELLED': return <Badge bg="danger">Cancelled</Badge>; // Status for the *ride* or *request*
      case 'REJECTED': return <Badge bg="danger">Rejected</Badge>; // Status for a ride *request*
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

  // Loading state for initial fetch
  // Use the local 'loading' state which is set/unset in fetchRideDetails
  if (loading && !ride) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ride details...</p>
      </Container>
    );
  }

  // Error state (combines initial fetch error and action errors)
  const displayError = error || rideError; // Show local action error first, then context fetch error
  if (displayError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {typeof displayError === 'string' ? displayError : 'An unknown error occurred.'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Ride not found state
  if (!ride) {
    // Avoid showing "Not Found" briefly while initial loading is true
    if (loading) return null;
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

      <Row>
        <Col lg={8} className="mb-4 mb-lg-0">
          <Tab.Container defaultActiveKey="details">
            <Card className="shadow-sm">
              <Card.Header>
                <Nav variant="tabs">
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
                                <Button 
                                  variant="success" 
                                  size="sm" 
                                  onClick={() => handleAction('accept_request', { requestId: request.id })} 
                                  disabled={loadingRef.current.accept_request || rideLoading || !ride} // Use ref state
                                  data-action="accept_request"
                                >
                                  {loadingRef.current.accept_request && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                                  Accept
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  onClick={() => handleAction('reject_request', { requestId: request.id })} 
                                  disabled={loadingRef.current.reject_request || rideLoading || !ride} // Use ref state
                                  data-action="reject_request"
                                >
                                  {loadingRef.current.reject_request && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                                  Reject
                                </Button>
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
                    {/* Show rider status based on their *request* status if they have one */}
                    {userRideRequest?.status === 'ACCEPTED' && ride.status === 'IN_PROGRESS' && ( <Alert variant="info">Your ride is in progress. Driver will complete it upon arrival.</Alert> )}
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
                       {/* Placeholder for Feedback content */}
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
                              disabled={loadingRef.current.rate || rideLoading || !ride} // Use ref state
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
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
                  <div className="d-flex gap-2">
                    {/* Action Buttons - Apply flicker fix and static text */}
                     {/* Driver starts ride when it's ACTIVE (meaning offered and ready) */}
                     {isDriver && ride.status === 'ACTIVE' && (
                       <Button 
                         variant="primary" 
                         onClick={() => handleAction('start')} 
                         disabled={loadingRef.current.start || rideLoading || !ride} // Use ref state
                         data-action="start"
                       >
                         {loadingRef.current.start && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                         Start Ride
                       </Button>
                     )}
                     {isDriver && ride.status === 'IN_PROGRESS' && (
                       <Button 
                         variant="success" 
                         onClick={() => handleAction('complete')} 
                         disabled={loadingRef.current.complete || rideLoading || !ride} // Use ref state
                         data-action="complete"
                       >
                         {loadingRef.current.complete && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                         Complete Ride
                       </Button>
                     )}
                     {/* Rider can rate only if their request was accepted and ride is completed */}
                     {userRideRequest?.status === 'ACCEPTED' && ride.status === 'COMPLETED' && !ride.rating && (
                       <Button 
                         variant="primary" 
                         onClick={() => setShowRatingModal(true)} 
                         disabled={loadingRef.current.rate || rideLoading || !ride} // Use ref state
                         data-action="rate"
                       >
                         Rate this Ride
                       </Button>
                     )}
                     {/* Allow cancellation if ride is ACTIVE or user request is PENDING/ACCEPTED */}
                     {(isDriver && ride.status === 'ACTIVE') || (userRideRequest && (userRideRequest.status === 'PENDING' || userRideRequest.status === 'ACCEPTED')) && ride.status !== 'IN_PROGRESS' && ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                       <Button 
                         variant="outline-danger" 
                         onClick={() => setShowCancelModal(true)} 
                         disabled={loadingRef.current.cancel || rideLoading || !ride} // Use ref state
                         data-action="cancel"
                       >
                         {isDriver ? 'Cancel Ride Offer' : 'Cancel Request'}
                       </Button>
                     )}
                     {/* Contact button shown if request is accepted or ride is in progress */}
                     {(userRideRequest?.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && (
                       <Button variant="outline-primary" onClick={() => setShowContactModal(true)} disabled={rideLoading || !ride}> {/* Remove actionLoading check */}
                         Contact {isDriver ? 'Passenger' : 'Driver'}
                       </Button>
                     )}
                     {/* Request button */}
                     {canRequest && (
                       <Button 
                         variant="success" 
                         onClick={() => handleAction('request_to_join')} 
                         disabled={loadingRef.current.request_to_join || rideLoading || !ride} // Use ref state
                         data-action="request_to_join"
                       >
                         {loadingRef.current.request_to_join && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                         Request This Ride
                       </Button>
                     )}
                    {/* Request Status Badges for the current user */}
                    {userRideRequest && userRideRequest.status === 'PENDING' && ( <Badge bg="warning" className="p-2 align-self-center">Request Pending</Badge> )}
                    {userRideRequest && userRideRequest.status === 'ACCEPTED' && ride.status !== 'IN_PROGRESS' && ride.status !== 'COMPLETED' && ( <Badge bg="info" className="p-2 align-self-center">Ride Booked!</Badge> )}
                    {userRideRequest && userRideRequest.status === 'REJECTED' && ( <Badge bg="danger" className="p-2 align-self-center">Request Rejected</Badge> )}
                    {userRideRequest && userRideRequest.status === 'CANCELLED' && ( <Badge bg="secondary" className="p-2 align-self-center">Request Cancelled</Badge> )}
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Tab.Container>
        </Col>

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
                  {(userRideRequest?.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && !isDriver && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="mt-3 w-100"
                      onClick={() => setShowContactModal(true)}
                      disabled={rideLoading || !ride} // Removed actionLoading check
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
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      {/* Cancel Ride Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel {isDriver ? 'Ride Offer' : 'Request'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel? This action cannot be undone.</p>
          <Form.Group className="mb-3">
            <Form.Label>Reason for cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason (optional for requests)"
              required={isDriver} // Reason required only if driver cancels offer
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() => handleAction('cancel', { reason: cancelReason })}
                      disabled={ (isDriver && !cancelReason.trim()) || loadingRef.current.cancel || rideLoading || !ride } // Use ref state + reason check
          >
            {loadingRef.current.cancel && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
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
            onClick={() => handleAction('rate', { rating, comment: ratingComment })}
            disabled={loadingRef.current.rate || rideLoading || !ride} // Use ref state
          >
            {loadingRef.current.rate && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
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
          {/* Simplified Contact Info - Adapt based on available data */}
          <div className="d-flex align-items-center mb-4">
             {/* Profile Pic */}
             {(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver)?.profilePicture ? (
              <img
                src={(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver).profilePicture}
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
            {/* Name & Rating */}
            <div>
              <h5 className="mb-1">
                {(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver)?.name || 'User'}
              </h5>
               <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" />
                <span>
                  {(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver)?.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
             {/* Phone */}
            <div className="d-flex align-items-center mb-3">
              <div className="me-3"><FaPhoneAlt className="text-primary" size={20} /></div>
              <div><p className="mb-0">{(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver)?.phone || 'No phone number available'}</p></div>
            </div>
             {/* Email */}
            <div className="d-flex align-items-center">
              <div className="me-3"><FaEnvelope className="text-primary" size={20} /></div>
              <div><p className="mb-0">{(isDriver ? ride.requests?.find(r=>r.status === 'ACCEPTED')?.passenger : ride.driver)?.email || 'No email available'}</p></div>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Send a Message</Form.Label>
            <div className="input-group">
              <Form.Control type="text" placeholder="Type your message here..." />
              <Button variant="primary"><FaComment className="me-2" />Send</Button>
            </div>
            <Form.Text className="text-muted">This feature is for demonstration purposes only.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default RideDetailsPage;
