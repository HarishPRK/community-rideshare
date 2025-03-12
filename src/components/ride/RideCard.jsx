import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave, 
  FaStar, 
  FaCar
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * RideCard - A reusable component for displaying ride information
 * 
 * Can be used on Home, Search Results, Ride History, etc.
 */
const RideCard = ({ 
  ride, 
  variant = 'default', // 'default', 'compact', 'horizontal'
  actions = true,
  onClick = null 
}) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  // Determine if the card should be clickable
  const cardProps = onClick ? { 
    onClick, 
    role: "button",
    className: "shadow-sm h-100 cursor-pointer hover-shadow"
  } : {
    className: "shadow-sm h-100"
  };

  return (
    <Card {...cardProps}>
      {variant === 'horizontal' ? (
        <div className="d-flex flex-column flex-md-row">
          <div className="p-3 flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span className="fw-bold">{formatDate(ride.departureDate)}</span>
                  <span className="ms-2 text-muted">
                    <FaClock className="me-1" />
                    {ride.departureTime}
                  </span>
                </div>
              </div>
              <div>
                {getStatusBadge(ride.status)}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="d-flex mb-2">
                <div className="me-2">
                  <FaMapMarkerAlt className="text-success" />
                </div>
                <div>
                  <div className="text-muted small">Pickup</div>
                  <div>{ride.pickupLocation?.address || 'N/A'}</div>
                </div>
              </div>
              
              <div className="d-flex">
                <div className="me-2">
                  <FaMapMarkerAlt className="text-danger" />
                </div>
                <div>
                  <div className="text-muted small">Dropoff</div>
                  <div>{ride.dropoffLocation?.address || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="d-flex flex-wrap gap-3">
              <div>
                <div className="text-muted small">Price</div>
                <div className="d-flex align-items-center">
                  <FaMoneyBillWave className="text-success me-1" />
                  <span>${ride.price?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              
              <div>
                <div className="text-muted small">Seats</div>
                <div className="d-flex align-items-center">
                  <FaUserFriends className="text-primary me-1" />
                  <span>{ride.maxPassengers || ride.passengers || 1}</span>
                </div>
              </div>
              
              {ride.distance && (
                <div>
                  <div className="text-muted small">Distance</div>
                  <div>{ride.distance}</div>
                </div>
              )}
              
              {ride.duration && (
                <div>
                  <div className="text-muted small">Duration</div>
                  <div>{ride.duration}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3 bg-light border-start" style={{ minWidth: '220px' }}>
            <div>
              <div className="d-flex align-items-center mb-3">
                {(ride.driver?.id ? ride.driver : ride.rider)?.profilePicture ? (
                  <img 
                    src={(ride.driver?.id ? ride.driver : ride.rider).profilePicture} 
                    alt="User" 
                    className="rounded-circle me-2"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    {ride.driver?.id ? (
                      <FaCar className="text-white" />
                    ) : (
                      <FaUserFriends className="text-white" />
                    )}
                  </div>
                )}
                <div>
                  <div>{ride.driver?.id ? 'Driver' : 'Passenger'}</div>
                  <div>{(ride.driver?.id ? ride.driver : ride.rider)?.name || 'User'}</div>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <FaStar className="text-warning me-1" />
                <span>
                  {(ride.driver?.id ? ride.driver : ride.rider)?.rating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-muted ms-1">
                  ({(ride.driver?.id ? ride.driver : ride.rider)?.ratingCount || 0} ratings)
                </span>
              </div>
              
              {ride.vehicle && (
                <div className="mb-3 small">
                  <div className="d-flex align-items-center text-muted">
                    <FaCar className="me-1" />
                    <span>
                      {ride.vehicle.color} {ride.vehicle.model}
                    </span>
                  </div>
                </div>
              )}
              
              {actions && (
                <Link to={`/rides/${ride.id}`}>
                  <Button variant="primary" className="w-100">
                    View Details
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span className="fw-bold">{formatDate(ride.departureDate)}</span>
                  <span className="ms-2 text-muted">
                    <FaClock className="me-1" />
                    {ride.departureTime}
                  </span>
                </div>
              </div>
              <div>
                {getStatusBadge(ride.status)}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="d-flex mb-2">
                <div className="me-2">
                  <FaMapMarkerAlt className="text-success" />
                </div>
                <div>
                  <div className="text-muted small">Pickup</div>
                  <div>{ride.pickupLocation?.address || 'N/A'}</div>
                </div>
              </div>
              
              <div className="d-flex">
                <div className="me-2">
                  <FaMapMarkerAlt className="text-danger" />
                </div>
                <div>
                  <div className="text-muted small">Dropoff</div>
                  <div>{ride.dropoffLocation?.address || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="d-flex flex-wrap gap-3">
              <div>
                <div className="text-muted small">Price</div>
                <div className="d-flex align-items-center">
                  <FaMoneyBillWave className="text-success me-1" />
                  <span>${ride.price?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              
              <div>
                <div className="text-muted small">Seats</div>
                <div className="d-flex align-items-center">
                  <FaUserFriends className="text-primary me-1" />
                  <span>{ride.maxPassengers || ride.passengers || 1}</span>
                </div>
              </div>
              
              {ride.distance && (
                <div>
                  <div className="text-muted small">Distance</div>
                  <div>{ride.distance}</div>
                </div>
              )}
              
              {ride.duration && (
                <div>
                  <div className="text-muted small">Duration</div>
                  <div>{ride.duration}</div>
                </div>
              )}
            </div>
            
            {variant !== 'compact' && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    {(ride.driver?.id ? ride.driver : ride.rider)?.profilePicture ? (
                      <img 
                        src={(ride.driver?.id ? ride.driver : ride.rider).profilePicture} 
                        alt="User" 
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                        style={{ width: '32px', height: '32px' }}
                      >
                        {ride.driver?.id ? (
                          <FaCar className="text-white" size={14} />
                        ) : (
                          <FaUserFriends className="text-white" size={14} />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="small">{(ride.driver?.id ? ride.driver : ride.rider)?.name || 'User'}</div>
                      <div className="d-flex align-items-center small">
                        <FaStar className="text-warning me-1" size={12} />
                        <span>
                          {(ride.driver?.id ? ride.driver : ride.rider)?.rating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {ride.vehicle && (
                    <div className="small text-muted">
                      <FaCar className="me-1" />
                      {ride.vehicle.model}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
          
          {actions && (
            <Card.Footer className="bg-white">
              <Link to={`/rides/${ride.id}`}>
                <Button variant="primary" className="w-100">
                  View Details
                </Button>
              </Link>
            </Card.Footer>
          )}
        </>
      )}
    </Card>
  );
};

RideCard.propTypes = {
  ride: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    departureDate: PropTypes.string.isRequired,
    departureTime: PropTypes.string.isRequired,
    pickupLocation: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }),
    dropoffLocation: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }),
    price: PropTypes.number,
    maxPassengers: PropTypes.number,
    passengers: PropTypes.number,
    distance: PropTypes.string,
    duration: PropTypes.string,
    driver: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      profilePicture: PropTypes.string,
      rating: PropTypes.number,
      ratingCount: PropTypes.number,
    }),
    rider: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      profilePicture: PropTypes.string,
      rating: PropTypes.number,
      ratingCount: PropTypes.number,
    }),
    vehicle: PropTypes.shape({
      model: PropTypes.string,
      color: PropTypes.string,
    }),
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'compact', 'horizontal']),
  actions: PropTypes.bool,
  onClick: PropTypes.func,
};

export default RideCard;