import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaExchangeAlt, 
  FaUser, 
  FaCar, 
  FaCheck, 
  FaTimes, 
  FaStar, 
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';

const RideHistoryPage = () => {
  const location = useLocation();
  const { userRides, refreshRides, loading: rideLoading, error: rideError } = useRide();
  const { currentUser } = useAuth();
  
  // Page state
  const [sortConfig, setSortConfig] = useState({
    key: 'departureDate',
    direction: 'desc'
  });
  const [successMessage, setSuccessMessage] = useState(location.state?.success ? "Operation successful!" : "");
  
  // Fetch ride history on component mount
  useEffect(() => {
    refreshRides();
  }, [refreshRides]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  // Sort rides
  const sortedRides = (rides) => {
    if (!rides || rides.length === 0) return [];
    
    return [...rides].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Special handling for nested properties or dates
      if (sortConfig.key === 'departureDate') {
        aValue = new Date(`${a.departureDate}T${a.departureTime}`);
        bValue = new Date(`${b.departureDate}T${b.departureTime}`);
      } else if (sortConfig.key === 'driver' || sortConfig.key === 'rider') {
        aValue = a[sortConfig.key]?.name || '';
        bValue = b[sortConfig.key]?.name || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge
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
  
  // Determine if the ride needs a rating
  const needsRating = (ride) => {
    return ride.status === 'completed' 
      && (ride.rider?.id === currentUser?.id)
      && !ride.rating;
  };
  
  // Loading spinner
  if (rideLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading ride history...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">My Rides</h2>
      
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
      
      {/* Error Message */}
      {rideError && (
        <Alert variant="danger" className="mb-4">
          {rideError}
        </Alert>
      )}
      
      <Tab.Container defaultActiveKey="upcoming">
        <Card className="shadow-sm">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="upcoming">
                  Upcoming Rides
                  {userRides.upcoming.length > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {userRides.upcoming.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="offered">
                  Rides I'm Driving
                  {userRides.offered.length > 0 && (
                    <Badge bg="success" className="ms-2">
                      {userRides.offered.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="requested">
                  Rides I've Booked
                  {userRides.requested.length > 0 && (
                    <Badge bg="info" className="ms-2">
                      {userRides.requested.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed">
                  Past Rides
                  {userRides.completed.length > 0 && (
                    <Badge bg="secondary" className="ms-2">
                      {userRides.completed.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body>
            <Tab.Content>
              {/* Upcoming Rides Tab */}
              <Tab.Pane eventKey="upcoming">
                {userRides.upcoming.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('departureDate')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Date & Time</span>
                              <span className="ms-1">{getSortIcon('departureDate')}</span>
                            </div>
                          </th>
                          <th>Route</th>
                          <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Status</span>
                              <span className="ms-1">{getSortIcon('status')}</span>
                            </div>
                          </th>
                          <th>
                            {currentUser && userRides.upcoming.some(ride => ride.driver?.id === currentUser.id) 
                              ? 'Passenger' 
                              : 'Driver'
                            }
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRides(userRides.upcoming).map((ride) => (
                          <tr key={ride.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <FaCalendarAlt className="text-primary" />
                                </div>
                                <div>
                                  <div>{formatDate(ride.departureDate)}</div>
                                  <div className="text-muted small">
                                    <FaClock className="me-1" />
                                    {ride.departureTime}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt className="text-primary me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.pickupLocation.address}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                  <FaMapMarkerAlt className="text-danger me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.dropoffLocation.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(ride.status)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {ride.driver?.id === currentUser?.id ? (
                                  // User is the driver, show passenger
                                  <>
                                    <div 
                                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                                      style={{ width: '32px', height: '32px' }}
                                    >
                                      <FaUser className="text-white" size={14} />
                                    </div>
                                    <div>
                                      <div>{ride.rider?.name || 'Passenger'}</div>
                                      <div className="d-flex align-items-center text-muted small">
                                        <FaStar className="text-warning me-1" />
                                        <span>{ride.rider?.rating?.toFixed(1) || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  // User is the passenger, show driver
                                  <>
                                    <div 
                                      className="rounded-circle bg-success d-flex align-items-center justify-content-center me-2"
                                      style={{ width: '32px', height: '32px' }}
                                    >
                                      <FaCar className="text-white" size={14} />
                                    </div>
                                    <div>
                                      <div>{ride.driver?.name || 'Driver'}</div>
                                      <div className="d-flex align-items-center text-muted small">
                                        <FaStar className="text-warning me-1" />
                                        <span>{ride.driver?.rating?.toFixed(1) || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link to={`/rides/${ride.id}`}>
                                  <Button variant="outline-primary" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaInfoCircle size={48} className="text-muted mb-3" />
                    <h5>No Upcoming Rides</h5>
                    <p className="text-muted mb-4">
                      You don't have any upcoming rides scheduled at the moment.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Link to="/request-ride">
                        <Button variant="primary">Request a Ride</Button>
                      </Link>
                      <Link to="/offer-ride">
                        <Button variant="outline-primary">Offer a Ride</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Offered Rides Tab */}
              <Tab.Pane eventKey="offered">
                {userRides.offered.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('departureDate')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Date & Time</span>
                              <span className="ms-1">{getSortIcon('departureDate')}</span>
                            </div>
                          </th>
                          <th>Route</th>
                          <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Status</span>
                              <span className="ms-1">{getSortIcon('status')}</span>
                            </div>
                          </th>
                          <th>Price</th>
                          <th>Passenger</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRides(userRides.offered).map((ride) => (
                          <tr key={ride.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <FaCalendarAlt className="text-primary" />
                                </div>
                                <div>
                                  <div>{formatDate(ride.departureDate)}</div>
                                  <div className="text-muted small">
                                    <FaClock className="me-1" />
                                    {ride.departureTime}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt className="text-primary me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.pickupLocation.address}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                  <FaMapMarkerAlt className="text-danger me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.dropoffLocation.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(ride.status)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaMoneyBillWave className="text-success me-1" />
                                <span>${ride.price?.toFixed(2) || '0.00'}/seat</span>
                              </div>
                            </td>
                            <td>
                              {/* Find accepted passengers from the requests array */}
                              {(() => {
                                const acceptedRequests = ride.requests?.filter(req => req.status === 'ACCEPTED') || [];
                                if (acceptedRequests.length > 0) {
                                  return acceptedRequests.map((request, index) => (
                                    <div key={request.id} className={`d-flex align-items-center ${index > 0 ? 'mt-1' : ''}`}>
                                      <div 
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                        <FaUser className="text-white" size={14} />
                                      </div>
                                      <div>
                                        <div>{request.passenger?.name || 'Passenger'}</div>
                                        <div className="d-flex align-items-center text-muted small">
                                          <FaStar className="text-warning me-1" />
                                          <span>{request.passenger?.rating?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ));
                                } else {
                                  return <span className="text-muted">No passenger yet</span>;
                                }
                              })()}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link to={`/rides/${ride.id}`}>
                                  <Button variant="outline-primary" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaInfoCircle size={48} className="text-muted mb-3" />
                    <h5>No Offered Rides</h5>
                    <p className="text-muted mb-4">
                      You haven't offered any rides yet. Want to help someone in your community?
                    </p>
                    <Link to="/offer-ride">
                      <Button variant="primary">Offer a Ride</Button>
                    </Link>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Requested Rides Tab */}
              <Tab.Pane eventKey="requested">
                {userRides.requested.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('departureDate')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Date & Time</span>
                              <span className="ms-1">{getSortIcon('departureDate')}</span>
                            </div>
                          </th>
                          <th>Route</th>
                          <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Status</span>
                              <span className="ms-1">{getSortIcon('status')}</span>
                            </div>
                          </th>
                          <th>Price</th>
                          <th>Driver</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRides(userRides.requested).map((ride) => (
                          <tr key={ride.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <FaCalendarAlt className="text-primary" />
                                </div>
                                <div>
                                  <div>{formatDate(ride.departureDate)}</div>
                                  <div className="text-muted small">
                                    <FaClock className="me-1" />
                                    {ride.departureTime}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt className="text-primary me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.pickupLocation.address}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                  <FaMapMarkerAlt className="text-danger me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.dropoffLocation.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(ride.status)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaMoneyBillWave className="text-success me-1" />
                                <span>${ride.price?.toFixed(2) || '0.00'}</span>
                              </div>
                            </td>
                            <td>
                              {ride.driver ? (
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle bg-success d-flex align-items-center justify-content-center me-2"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <FaCar className="text-white" size={14} />
                                  </div>
                                  <div>
                                    <div>{ride.driver.name}</div>
                                    <div className="d-flex align-items-center text-muted small">
                                      <FaStar className="text-warning me-1" />
                                      <span>{ride.driver.rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">No driver yet</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link to={`/rides/${ride.id}`}>
                                  <Button variant="outline-primary" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaInfoCircle size={48} className="text-muted mb-3" />
                    <h5>No Requested Rides</h5>
                    <p className="text-muted mb-4">
                      You haven't requested any rides yet. Need a ride somewhere?
                    </p>
                    <Link to="/request-ride">
                      <Button variant="primary">Request a Ride</Button>
                    </Link>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Completed Rides Tab */}
              <Tab.Pane eventKey="completed">
                {userRides.completed.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('departureDate')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Date & Time</span>
                              <span className="ms-1">{getSortIcon('departureDate')}</span>
                            </div>
                          </th>
                          <th>Route</th>
                          <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <span>Status</span>
                              <span className="ms-1">{getSortIcon('status')}</span>
                            </div>
                          </th>
                          <th>Role</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRides(userRides.completed).map((ride) => (
                          <tr key={ride.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <FaCalendarAlt className="text-primary" />
                                </div>
                                <div>
                                  <div>{formatDate(ride.departureDate)}</div>
                                  <div className="text-muted small">
                                    <FaClock className="me-1" />
                                    {ride.departureTime}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt className="text-primary me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.pickupLocation.address}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                  <FaMapMarkerAlt className="text-danger me-1" />
                                  <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                    {ride.dropoffLocation.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(ride.status)}</td>
                            <td>
                              {ride.driver?.id === currentUser?.id ? (
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle bg-success d-flex align-items-center justify-content-center me-2"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <FaCar className="text-white" size={14} />
                                  </div>
                                  <span>Driver</span>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <FaUser className="text-white" size={14} />
                                  </div>
                                  <span>Passenger</span>
                                </div>
                              )}
                            </td>
                            <td>
                              {ride.status === 'completed' ? (
                                <>
                                  {ride.rating ? (
                                    <div className="d-flex align-items-center">
                                      <div className="d-flex">
                                        {[...Array(5)].map((_, i) => (
                                          <FaStar 
                                            key={i} 
                                            className={i < ride.rating ? "text-warning" : "text-muted"}
                                          />
                                        ))}
                                      </div>
                                      <span className="ms-1">{ride.rating}/5</span>
                                    </div>
                                  ) : (
                                    <>
                                      {needsRating(ride) ? (
                                        <Badge bg="warning">Needs Rating</Badge>
                                      ) : (
                                        <span className="text-muted">Not rated</span>
                                      )}
                                    </>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link to={`/rides/${ride.id}`}>
                                  <Button variant="outline-primary" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                                
                                {needsRating(ride) && (
                                  <Link to={`/rides/${ride.id}`} state={{ showRating: true }}>
                                    <Button variant="warning" size="sm">
                                      Rate
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaInfoCircle size={48} className="text-muted mb-3" />
                    <h5>No Past Rides</h5>
                    <p className="text-muted mb-4">
                      You don't have any completed or cancelled rides yet.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Link to="/request-ride">
                        <Button variant="primary">Request a Ride</Button>
                      </Link>
                      <Link to="/offer-ride">
                        <Button variant="outline-primary">Offer a Ride</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Ride Statistics</h4>
              <Row>
                <Col sm={6} md={3} className="mb-3 mb-md-0">
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-primary mb-2">
                      {userRides.offered.length}
                    </div>
                    <div className="text-muted">Rides Offered</div>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3 mb-md-0">
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-info mb-2">
                      {userRides.requested.length}
                    </div>
                    <div className="text-muted">Rides Requested</div>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3 mb-md-0">
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-success mb-2">
                      {userRides.completed.filter(ride => ride.status === 'completed').length}
                    </div>
                    <div className="text-muted">Completed Rides</div>
                  </div>
                </Col>
                <Col sm={6} md={3}>
                  <div className="text-center p-3 border rounded">
                    <div className="display-6 text-warning mb-2">
                      {currentUser?.rating?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-muted">Average Rating</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RideHistoryPage;
