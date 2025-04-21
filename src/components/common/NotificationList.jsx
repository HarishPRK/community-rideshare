import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  ListGroup, 
  Badge, 
  Button, 
  Dropdown,
  Spinner,
  Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaCar, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaEnvelope, 
  FaMoneyBillWave,
  FaStar,
  FaEllipsisH,
  FaTrash,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

/**
 * NotificationList - A component for displaying user notifications
 * 
 * Used for showing:
 * - Ride updates (confirmed, canceled, etc.)
 * - New messages
 * - Payment notifications
 * - System alerts
 */
const NotificationList = ({
  notifications = [],
  loading = false,
  error = null,
  onMarkAsRead = null,
  onMarkAllAsRead = null,
  onDelete = null,
  emptyMessage = 'No notifications',
  maxItems = null,
  showControls = true,
  compact = false,
  className = ''
}) => {
  // Local state for dropdown menu
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Sort notifications by date
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  // Limit number of notifications if maxItems is set
  const displayedNotifications = maxItems ? 
    sortedNotifications.slice(0, maxItems) : 
    sortedNotifications;
  
  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      // Show time for notifications from today
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      // Show "Yesterday" for notifications from yesterday
      return 'Yesterday';
    } else {
      // Show date for older notifications
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ride_request':
      case 'ride_accepted':
      case 'ride_started':
      case 'ride_completed':
        return <FaCar className="text-primary" />;
      
      case 'ride_canceled':
        return <FaTimesCircle className="text-danger" />;
      
      case 'payment':
        return <FaMoneyBillWave className="text-success" />;
      
      case 'message':
        return <FaEnvelope className="text-info" />;
      
      case 'reminder':
        return <FaCalendarAlt className="text-warning" />;
      
      case 'rating':
        return <FaStar className="text-warning" />;
        
      case 'system':
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };
  
  // Handle mark as read/unread
  const handleMarkAsRead = (id, isRead) => {
    if (onMarkAsRead) {
      onMarkAsRead(id, isRead);
    }
    
    // Close dropdown
    setActiveDropdown(null);
  };
  
  // Handle delete notification
  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    }
    
    // Close dropdown
    setActiveDropdown(null);
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };
  
  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  // If loading
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading notifications...</span>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  // If no notifications
  if (displayedNotifications.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <FaBell className="mb-3" size={24} />
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Controls section */}
      {showControls && notifications.length > 0 && (
        <div className="d-flex justify-content-end mb-3">
          <Button 
            variant="link" 
            size="sm" 
            className="text-decoration-none"
            onClick={handleMarkAllAsRead}
          >
            <FaCheckCircle className="me-1" />
            Mark all as read
          </Button>
        </div>
      )}
      
      {/* Notifications list */}
      <ListGroup>
        {displayedNotifications.map((notification) => (
          <ListGroup.Item
            key={notification.id}
            className={`notification-item ${notification.isRead ? 'bg-light' : ''} ${compact ? 'py-2' : 'py-3'}`}
            style={{ position: 'relative' }}
          >
            <div className="d-flex">
              <div className="me-3">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-grow-1">
                {/* Notification content */}
                <div className={`notification-content ${!notification.isRead ? 'fw-bold' : ''}`}>
                  {notification.link ? (
                    <Link 
                      to={notification.link} 
                      className="text-decoration-none text-dark"
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id, true)}
                    >
                      {notification.message}
                    </Link>
                  ) : (
                    notification.message
                  )}
                </div>
                
                {/* Notification meta */}
                <div className="notification-meta d-flex align-items-center mt-1">
                  <small className="text-muted me-2">
                    {formatDate(notification.timestamp)}
                  </small>
                  
                  {!notification.isRead && (
                    <Badge bg="primary" pill className="me-2">
                      New
                    </Badge>
                  )}
                  
                  {notification.priority === 'high' && (
                    <Badge bg="danger" pill>
                      Important
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Action dropdown */}
              {showControls && (
                <div className="notification-actions">
                  <Dropdown show={activeDropdown === notification.id} align="end">
                    <Dropdown.Toggle 
                      as={Button} 
                      variant="link" 
                      size="sm" 
                      className="text-secondary p-0 shadow-none"
                      onClick={() => toggleDropdown(notification.id)}
                    >
                      <FaEllipsisH />
                    </Dropdown.Toggle>
                    
                    <Dropdown.Menu>
                      {notification.link && (
                        <Dropdown.Item as={Link} to={notification.link}>
                          <FaEye className="me-2" />
                          View Details
                        </Dropdown.Item>
                      )}
                      
                      <Dropdown.Item 
                        onClick={() => handleMarkAsRead(
                          notification.id, 
                          !notification.isRead
                        )}
                      >
                        {notification.isRead ? (
                          <>
                            <FaEyeSlash className="me-2" />
                            Mark as Unread
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="me-2" />
                            Mark as Read
                          </>
                        )}
                      </Dropdown.Item>
                      
                      <Dropdown.Item 
                        className="text-danger" 
                        onClick={() => handleDelete(notification.id)}
                      >
                        <FaTrash className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      {/* Show more link if maxItems is set and there are more notifications */}
      {maxItems && notifications.length > maxItems && (
        <div className="text-center mt-3">
          <Link to="/notifications" className="text-decoration-none">
            View all notifications ({notifications.length})
          </Link>
        </div>
      )}
    </div>
  );
};

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        'ride_request',
        'ride_accepted',
        'ride_started',
        'ride_completed',
        'ride_canceled',
        'payment',
        'message',
        'reminder',
        'rating',
        'system'
      ]).isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      isRead: PropTypes.bool,
      priority: PropTypes.oneOf(['normal', 'high']),
      link: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onMarkAsRead: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  emptyMessage: PropTypes.string,
  maxItems: PropTypes.number,
  showControls: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string
};

export default NotificationList;