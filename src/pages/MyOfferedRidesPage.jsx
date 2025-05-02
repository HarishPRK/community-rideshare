import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  // FaUser, // Removed unused
  // FaCar, // Removed unused
  // FaStar, // Removed unused
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaMoneyBillWave,
  FaPlus,
  FaCheckCircle
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
// Removed unused useAuth import

const MyOfferedRidesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRides, refreshRides, loading: rideLoading, error: rideError } = useRide();
  // const { currentUser } = useAuth(); // This line was already commented out
  
  // State
  const [sortConfig, setSortConfig] = useState({
    key: 'departureDate',
    direction: 'desc'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [offeredRides, setOfferedRides] = useState([]);
  
  // Check for success message in navigation state
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message || "Ride offered successfully!");
      
      // Clear the state to prevent showing the message after refresh
      const newState = { ...location.state };
      delete newState.success;
      delete newState.message;
      navigate(location.pathname, { state: Object.keys(newState).length ? newState : undefined, replace: true });
    }
  }, [location, navigate]);
  
  // Fetch ride data on component mount
  useEffect(() => {
    refreshRides();
  }, [refreshRides]);
  
  // Update offered rides when userRides changes
  useEffect(() => {
    if (userRides && userRides.offered) {
      setOfferedRides(userRides.offered);
    }
  }, [userRides]);
  
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
  const sortedRides = () => {
    if (!offeredRides || offeredRides.length === 0) return [];
    
    return [...offeredRides].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Special handling for nested properties or dates
      if (sortConfig.key === 'departureDate') {
        aValue = new Date(`${a.departureDate}T${a.departureTime}`);
        bValue = new Date(`${b.departureDate}T${b.departureTime}`);
      } else if (sortConfig.key === 'price') {
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
      } else if (sortConfig.key === 'maxPassengers') {
        aValue = parseInt(a.maxPassengers);
        bValue = parseInt(b.maxPassengers);
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
  
  // Format date to display the date as intended from UTC string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the date string, which might be like "2025-05-02T00:00:00.000Z"
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Attempt to parse just the date part if full timestamp fails
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          // Use Date.UTC to get timestamp, then create Date object
          const utcDate = new Date(Date.UTC(year, month, day));
           if (!isNaN(utcDate.getTime())) {
             return utcDate.toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               timeZone: 'UTC' // Specify UTC timezone for formatting
             });
           }
        }
        return "Invalid Date";
      }
      // Format the valid date object using UTC timezone
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Specify UTC timezone
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'PENDING':
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'ACCEPTED':
      case 'accepted':
        return <Badge bg="info">Accepted</Badge>;
      case 'IN_PROGRESS':
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'COMPLETED':
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'CANCELLED':
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Get passenger fill percentage
  const getPassengerFillPercentage = (ride) => {
    const fillPercentage = ride.passengers / ride.maxPassengers * 100;
    return Math.round(fillPercentage);
  };
  
  // Get fill color based on percentage
  const getFillColor = (percentage) => {
    if (percentage === 0) return 'bg-light';
    if (percentage <= 25) return 'bg-danger';
    if (percentage <= 50) return 'bg-warning';
    if (percentage <= 75) return 'bg-info';
    return 'bg-success';
  };
  
  // Loading spinner
  if (rideLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your offered rides...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Offered Rides</h2>
        <Link to="/offer-ride">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Offer a New Ride
          </Button>
        </Link>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccessMessage('')}
          className="mb-4"
        >
          <div className="d-flex align-items-center">
            <FaCheckCircle className="me-2" size={20} />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}
      
      {/* Error Message */}
      {rideError && (
        <Alert variant="danger" className="mb-4">
          {rideError}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          {offeredRides.length > 0 ? (
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
                    <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-center">
                        <span>Price</span>
                        <span className="ms-1">{getSortIcon('price')}</span>
                      </div>
                    </th>
                    <th>Passengers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRides().map((ride) => (
                    <tr key={ride.id} className={location.state?.highlightId === ride.id ? 'table-info' : ''}>
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
                              {ride.pickupLocation?.address || 'N/A'}
                            </span>
                          </div>
                          <div className="d-flex align-items-center mt-1">
                            <FaMapMarkerAlt className="text-danger me-1" />
                            <span className="text-truncate" style={{ maxWidth: '150px' }}>
                              {ride.dropoffLocation?.address || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(ride.status)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMoneyBillWave className="text-success me-1" />
                          <span>${parseFloat(ride.price).toFixed(2)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <span className="fw-bold">{ride.passengers || 0}/{ride.maxPassengers}</span>
                          </div>
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar ${getFillColor(getPassengerFillPercentage(ride))}`} 
                              role="progressbar" 
                              style={{ width: `${getPassengerFillPercentage(ride)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/rides/${ride.id}`}>
                            <Button variant="outline-primary" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {(ride.status === 'ACTIVE' || ride.status === 'active') && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => navigate(`/rides/${ride.id}`, { state: { showCancel: true } })}
                            >
                              Cancel
                            </Button>
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
              <h5>No Offered Rides</h5>
              <p className="text-muted mb-4">
                You haven't offered any rides yet. Want to help someone in your community?
              </p>
              <Link to="/offer-ride">
                <Button variant="primary">Offer a Ride</Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                {offeredRides.length}
              </div>
              <div className="text-muted">Total Rides Offered</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                {offeredRides.filter(ride => ride.status === 'COMPLETED' || ride.status === 'completed').length}
              </div>
              <div className="text-muted">Completed Rides</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                ${offeredRides.reduce((total, ride) => total + parseFloat(ride.price || 0), 0).toFixed(2)}
              </div>
              <div className="text-muted">Total Earnings</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyOfferedRidesPage;
