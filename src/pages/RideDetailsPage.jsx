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
    case 'request': return context.requestRide;
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
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ride details...</p>
      </Container>
    );
  }

  // Error state
  const displayError = error || rideError;
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
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>

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
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered> {/* ... Cancel Modal ... */} </Modal>
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered> {/* ... Rating Modal ... */} </Modal>
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered> {/* ... Contact Modal ... */} </Modal>

    </Container>
  );
};

export default RideDetailsPage;
