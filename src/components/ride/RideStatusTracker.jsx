import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Badge } from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaCircle, 
  FaRegCircle, 
  FaClock, 
  FaCarSide, 
  FaMapMarkerAlt, 
  FaFlag, 
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

/**
 * RideStatusTracker - A component to visualize ride progress
 * 
 * Shows a timeline of ride statuses from request to completion
 * Highlights the current status
 */
const RideStatusTracker = ({
  status = 'pending',
  driverAssigned = false,
  vertical = false,
  detailed = true,
  showTimestamps = true,
  timestamps = {},
  className = ''
}) => {
  // Define all possible statuses in order
  const statuses = [
    { 
      key: 'pending', 
      label: 'Requested', 
      icon: <FaClock />, 
      timestamp: timestamps.requested 
    },
    { 
      key: 'accepted', 
      label: 'Accepted', 
      icon: <FaCheckCircle />, 
      timestamp: timestamps.accepted 
    },
    { 
      key: 'in_progress', 
      label: 'In Progress', 
      icon: <FaCarSide />, 
      timestamp: timestamps.started 
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      icon: <FaFlag />, 
      timestamp: timestamps.completed 
    }
  ];
  
  // Add cancelled status if ride is cancelled
  if (status === 'cancelled') {
    statuses.push({ 
      key: 'cancelled', 
      label: 'Cancelled', 
      icon: <FaTimesCircle />, 
      timestamp: timestamps.cancelled 
    });
  }
  
  // Find the current status index
  const currentIndex = statuses.findIndex(s => s.key === status);
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
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
  
  // Get status description
  const getStatusDescription = (key) => {
    switch (key) {
      case 'pending':
        return driverAssigned 
          ? 'Your ride request is pending confirmation from the driver.' 
          : 'Looking for a driver to accept your ride request.';
      case 'accepted':
        return 'A driver has accepted your ride request and will arrive at the pickup location.';
      case 'in_progress':
        return 'Your ride is in progress. Enjoy your journey!';
      case 'completed':
        return 'Your ride has been completed. Thank you for using Community RideShare!';
      case 'cancelled':
        return 'This ride has been cancelled.';
      default:
        return '';
    }
  };
  
  // Render step icon based on status
  const renderStepIcon = (step, index) => {
    if (index < currentIndex || step.key === status) {
      // Completed or current step
      return (
        <div className={`step-icon ${step.key === status ? 'current' : 'completed'}`}>
          <span className={step.key === status ? 'text-primary' : 'text-success'}>
            {step.key === status ? step.icon : <FaCheckCircle />}
          </span>
        </div>
      );
    } else if (status === 'cancelled' && index > currentIndex) {
      // Steps after cancellation
      return (
        <div className="step-icon cancelled">
          <span className="text-secondary">
            <FaTimesCircle />
          </span>
        </div>
      );
    } else {
      // Future step
      return (
        <div className="step-icon pending">
          <span className="text-muted">
            <FaRegCircle />
          </span>
        </div>
      );
    }
  };
  
  // Vertical timeline layout
  if (vertical) {
    return (
      <div className={`ride-status-tracker vertical ${className}`}>
        {statuses.map((step, index) => {
          const isActive = step.key === status;
          const isCompleted = index < currentIndex;
          const isCancelled = status === 'cancelled' && step.key !== 'cancelled';
          
          return (
            <div 
              key={step.key}
              className={`timeline-item d-flex ${
                isActive ? 'active' : 
                isCompleted ? 'completed' : 
                isCancelled ? 'cancelled' : ''
              }`}
            >
              <div className="timeline-icon me-3">
                {renderStepIcon(step, index)}
                {index < statuses.length - 1 && !isCancelled && (
                  <div className={`timeline-line ${
                    index < currentIndex ? 'completed' : 'pending'
                  }`}></div>
                )}
              </div>
              
              <div className="timeline-content py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-1">{step.label}</h6>
                  {step.key === status && getStatusBadge(status)}
                </div>
                
                {(showTimestamps && step.timestamp) && (
                  <div className="timeline-time text-muted small mb-1">
                    {formatTimestamp(step.timestamp)}
                  </div>
                )}
                
                {(detailed && isActive) && (
                  <div className="timeline-description text-muted">
                    {getStatusDescription(step.key)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <style jsx>{`
          .ride-status-tracker.vertical {
            position: relative;
            padding: 0 0 0 0.5rem;
          }
          
          .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
          }
          
          .timeline-icon {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .step-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #dee2e6;
            z-index: 2;
          }
          
          .step-icon.current {
            border-color: #0d6efd;
          }
          
          .step-icon.completed {
            border-color: #198754;
          }
          
          .step-icon.cancelled {
            border-color: #dc3545;
          }
          
          .timeline-line {
            position: absolute;
            top: 30px;
            bottom: -15px;
            left: 50%;
            width: 2px;
            transform: translateX(-50%);
            background-color: #dee2e6;
          }
          
          .timeline-line.completed {
            background-color: #198754;
          }
          
          .timeline-item:last-child .timeline-line {
            display: none;
          }
        `}</style>
      </div>
    );
  }
  
  // Horizontal timeline layout
  return (
    <div className={`ride-status-tracker horizontal ${className}`}>
      <Row>
        {statuses.map((step, index) => {
          const isActive = step.key === status;
          const isCompleted = index < currentIndex;
          const isCancelled = status === 'cancelled' && index > currentIndex && step.key !== 'cancelled';
          
          return (
            <Col key={step.key} className="position-relative">
              {/* Connector line */}
              {index < statuses.length - 1 && !isCancelled && (
                <div 
                  className={`connector-line ${
                    index < currentIndex ? 'bg-success' : 'bg-light'
                  }`}
                ></div>
              )}
              
              {/* Status icon */}
              <div className="text-center mb-2">
                <div 
                  className={`
                    status-circle mx-auto d-flex align-items-center justify-content-center
                    ${isActive ? 'border-primary text-primary' : ''}
                    ${isCompleted ? 'border-success text-success' : ''}
                    ${!isActive && !isCompleted ? 'border-secondary text-muted' : ''}
                    ${isCancelled ? 'border-danger text-danger' : ''}
                  `}
                >
                  {isCompleted ? <FaCheckCircle /> : step.icon}
                </div>
              </div>
              
              {/* Status label */}
              <div className="text-center">
                <div 
                  className={`
                    status-label 
                    ${isActive ? 'fw-bold text-primary' : ''} 
                    ${isCompleted ? 'text-success' : ''}
                    ${!isActive && !isCompleted && !isCancelled ? 'text-muted' : ''}
                    ${isCancelled ? 'text-danger' : ''}
                  `}
                >
                  {step.label}
                </div>
                
                {showTimestamps && step.timestamp && (
                  <div className="status-time small text-muted">
                    {formatTimestamp(step.timestamp)}
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
      
      {/* Current status description */}
      {detailed && status !== 'cancelled' && (
        <div className="current-status-details mt-4 p-3 border rounded bg-light">
          <div className="d-flex align-items-start">
            {status === 'pending' ? (
              <FaClock className="text-warning mt-1 me-2" size={18} />
            ) : status === 'accepted' ? (
              <FaMapMarkerAlt className="text-info mt-1 me-2" size={18} />
            ) : status === 'in_progress' ? (
              <FaCarSide className="text-primary mt-1 me-2" size={18} />
            ) : status === 'completed' ? (
              <FaCheckCircle className="text-success mt-1 me-2" size={18} />
            ) : (
              <FaExclamationTriangle className="text-danger mt-1 me-2" size={18} />
            )}
            <div>
              <h6 className="mb-1">
                {status === 'pending' ? 'Waiting for driver' : 
                 status === 'accepted' ? 'Driver is on the way' :
                 status === 'in_progress' ? 'Your ride is in progress' :
                 status === 'completed' ? 'Ride completed' : 
                 'Ride status'}
              </h6>
              <p className="mb-0 text-muted">
                {getStatusDescription(status)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancelled status description */}
      {detailed && status === 'cancelled' && (
        <div className="current-status-details mt-4 p-3 border border-danger rounded bg-light">
          <div className="d-flex align-items-start">
            <FaTimesCircle className="text-danger mt-1 me-2" size={18} />
            <div>
              <h6 className="mb-1 text-danger">Ride Cancelled</h6>
              <p className="mb-0 text-muted">
                {getStatusDescription('cancelled')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .connector-line {
          position: absolute;
          top: 15px;
          left: 50%;
          height: 2px;
          width: 100%;
          z-index: 1;
        }
        
        .status-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid;
          background-color: white;
          z-index: 2;
          position: relative;
        }
        
        .status-label {
          font-size: 0.875rem;
        }
        
        .current-status-details {
          border-left: 4px solid;
          border-left-color: var(--bs-primary);
        }
      `}</style>
    </div>
  );
};

RideStatusTracker.propTypes = {
  status: PropTypes.oneOf(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
  driverAssigned: PropTypes.bool,
  vertical: PropTypes.bool,
  detailed: PropTypes.bool,
  showTimestamps: PropTypes.bool,
  timestamps: PropTypes.shape({
    requested: PropTypes.string,
    accepted: PropTypes.string,
    started: PropTypes.string,
    completed: PropTypes.string,
    cancelled: PropTypes.string
  }),
  className: PropTypes.string
};

export default RideStatusTracker;