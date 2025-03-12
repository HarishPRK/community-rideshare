import React from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Button, 
  Badge, 
  ListGroup,
  Row,
  Col
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaStar, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaIdCard,
  FaCarAlt,
  FaShieldAlt,
  FaUserCheck,
  FaUserCircle
} from 'react-icons/fa';
import RatingComponent from '../common/RatingComponent';

/**
 * UserProfileCard - A component to display user profile information
 * 
 * Can be used in:
 * - User profile pages
 * - Ride details to show driver/passenger info
 * - User listing pages
 */
const UserProfileCard = ({
  user,
  variant = 'default', // 'default', 'compact', 'horizontal'
  showActions = true,
  showRating = true,
  showContact = false,
  showVerification = false,
  isDriver = false,
  className = '',
  onMessageClick = null,
  onCallClick = null
}) => {
  if (!user) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <Badge bg="success" className="d-inline-flex align-items-center">
        <FaUserCheck className="me-1" />
        Verified
      </Badge>
    ) : (
      <Badge bg="secondary" className="d-inline-flex align-items-center">
        Unverified
      </Badge>
    );
  };
  
  // Handle contact clicks
  const handleMessageClick = () => {
    if (onMessageClick) onMessageClick(user);
  };
  
  const handleCallClick = () => {
    if (onCallClick) onCallClick(user);
  };
  
  // Render compact variant
  if (variant === 'compact') {
    return (
      <Card className={`user-profile-card ${className}`}>
        <Card.Body className="d-flex align-items-center p-3">
          <div className="me-3">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="rounded-circle"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
              >
                <FaUserCircle className="text-secondary" size={30} />
              </div>
            )}
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-0">{user.name}</h6>
                {showRating && (
                  <div className="d-flex align-items-center small">
                    <FaStar className="text-warning me-1" />
                    <span>{user.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-muted ms-1">
                      ({user.ratingCount || 0})
                    </span>
                  </div>
                )}
              </div>
              
              {user.isVerified && (
                <Badge bg="success" pill>
                  <FaUserCheck size={10} />
                </Badge>
              )}
            </div>
            
            {(user.bio || isDriver) && (
              <div className="mt-1 text-muted small">
                {isDriver ? 'Driver' : user.bio ? user.bio.substring(0, 60) + (user.bio.length > 60 ? '...' : '') : ''}
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="ms-2">
              <Link to={`/users/${user.id}`}>
                <Button variant="outline-primary" size="sm">View</Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }
  
  // Render horizontal variant
  if (variant === 'horizontal') {
    return (
      <Card className={`user-profile-card ${className}`}>
        <Card.Body className="p-0">
          <Row className="g-0">
            <Col md={4} className="p-3 text-center border-end">
              <div className="mb-3">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="rounded-circle"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <FaUserCircle className="text-secondary" size={60} />
                  </div>
                )}
              </div>
              
              <h5>{user.name}</h5>
              
              {showRating && (
                <div className="mb-3">
                  <RatingComponent 
                    value={user.rating || 0} 
                    count={user.ratingCount || 0}
                    size="sm"
                  />
                </div>
              )}
              
              {user.isVerified && (
                <div className="mb-3">
                  {getVerificationBadge(user.isVerified)}
                </div>
              )}
              
              {showActions && (
                <div className="d-grid gap-2">
                  <Link to={`/users/${user.id}`}>
                    <Button variant="primary" size="sm" className="w-100">
                      View Full Profile
                    </Button>
                  </Link>
                  
                  {showContact && (
                    <>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="w-100"
                        onClick={handleMessageClick}
                      >
                        <FaEnvelope className="me-1" />
                        Message
                      </Button>
                      
                      {user.phone && (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="w-100"
                          onClick={handleCallClick}
                        >
                          <FaPhone className="me-1" />
                          Call
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </Col>
            
            <Col md={8} className="p-3">
              {user.bio && (
                <div className="mb-3">
                  <h6>About</h6>
                  <p className="text-muted">{user.bio}</p>
                </div>
              )}
              
              <ListGroup variant="flush" className="border-top pt-2">
                {user.joinDate && (
                  <ListGroup.Item className="px-0 py-2 d-flex border-0">
                    <div className="me-3">
                      <FaCalendarAlt className="text-primary" />
                    </div>
                    <div>
                      <strong>Member Since</strong>
                      <div>{formatDate(user.joinDate)}</div>
                    </div>
                  </ListGroup.Item>
                )}
                
                {user.address && (
                  <ListGroup.Item className="px-0 py-2 d-flex border-0">
                    <div className="me-3">
                      <FaMapMarkerAlt className="text-primary" />
                    </div>
                    <div>
                      <strong>Location</strong>
                      <div>{user.address}</div>
                    </div>
                  </ListGroup.Item>
                )}
                
                {showContact && user.email && (
                  <ListGroup.Item className="px-0 py-2 d-flex border-0">
                    <div className="me-3">
                      <FaEnvelope className="text-primary" />
                    </div>
                    <div>
                      <strong>Email</strong>
                      <div>{user.email}</div>
                    </div>
                  </ListGroup.Item>
                )}
                
                {showContact && user.phone && (
                  <ListGroup.Item className="px-0 py-2 d-flex border-0">
                    <div className="me-3">
                      <FaPhone className="text-primary" />
                    </div>
                    <div>
                      <strong>Phone</strong>
                      <div>{user.phone}</div>
                    </div>
                  </ListGroup.Item>
                )}
                
                {isDriver && user.vehicle && (
                  <ListGroup.Item className="px-0 py-2 d-flex border-0">
                    <div className="me-3">
                      <FaCarAlt className="text-primary" />
                    </div>
                    <div>
                      <strong>Vehicle</strong>
                      <div>{user.vehicle.color} {user.vehicle.model} ({user.vehicle.year})</div>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
              
              {showVerification && (
                <div className="mt-3 pt-3 border-top">
                  <h6>Verification Status</h6>
                  <Row className="g-3">
                    <Col xs={6} sm={4}>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <FaIdCard className={user.identityVerified ? "text-success" : "text-secondary"} />
                        </div>
                        <div>
                          <div className="small">Identity</div>
                          <div>
                            {getVerificationBadge(user.identityVerified)}
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={6} sm={4}>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <FaPhone className={user.phoneVerified ? "text-success" : "text-secondary"} />
                        </div>
                        <div>
                          <div className="small">Phone</div>
                          <div>
                            {getVerificationBadge(user.phoneVerified)}
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    {isDriver && (
                      <Col xs={6} sm={4}>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <FaCarAlt className={user.vehicleVerified ? "text-success" : "text-secondary"} />
                          </div>
                          <div>
                            <div className="small">Vehicle</div>
                            <div>
                              {getVerificationBadge(user.vehicleVerified)}
                            </div>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
  
  // Default vertical variant
  return (
    <Card className={`user-profile-card ${className}`}>
      <Card.Body className="text-center p-4">
        <div className="mb-3">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="rounded-circle"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
              style={{ width: '120px', height: '120px' }}
            >
              <FaUserCircle className="text-secondary" size={80} />
            </div>
          )}
        </div>
        
        <h5>{user.name}</h5>
        
        {showRating && (
          <div className="mb-3">
            <RatingComponent 
              value={user.rating || 0} 
              count={user.ratingCount || 0}
              size="md"
            />
          </div>
        )}
        
        {user.isVerified && (
          <div className="mb-3">
            {getVerificationBadge(user.isVerified)}
          </div>
        )}
        
        {user.bio && (
          <div className="mb-3">
            <p className="text-muted">
              {user.bio.length > 120 ? user.bio.substring(0, 120) + '...' : user.bio}
            </p>
          </div>
        )}
        
        <ListGroup variant="flush" className="text-start mb-3">
          {user.joinDate && (
            <ListGroup.Item className="px-0 py-2 d-flex border-0">
              <div className="me-3">
                <FaCalendarAlt className="text-primary" />
              </div>
              <div>
                <strong>Member Since</strong>
                <div>{formatDate(user.joinDate)}</div>
              </div>
            </ListGroup.Item>
          )}
          
          {user.address && (
            <ListGroup.Item className="px-0 py-2 d-flex border-0">
              <div className="me-3">
                <FaMapMarkerAlt className="text-primary" />
              </div>
              <div>
                <strong>Location</strong>
                <div>{user.address}</div>
              </div>
            </ListGroup.Item>
          )}
          
          {isDriver && user.vehicle && (
            <ListGroup.Item className="px-0 py-2 d-flex border-0">
              <div className="me-3">
                <FaCarAlt className="text-primary" />
              </div>
              <div>
                <strong>Vehicle</strong>
                <div>{user.vehicle.color} {user.vehicle.model} ({user.vehicle.year})</div>
              </div>
            </ListGroup.Item>
          )}
        </ListGroup>
        
        {showActions && (
          <div className="d-grid gap-2">
            <Link to={`/users/${user.id}`}>
              <Button variant="primary" className="w-100">
                View Full Profile
              </Button>
            </Link>
            
            {showContact && (
              <>
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={handleMessageClick}
                >
                  <FaEnvelope className="me-1" />
                  Message
                </Button>
                
                {user.phone && (
                  <Button 
                    variant="outline-success" 
                    className="w-100"
                    onClick={handleCallClick}
                  >
                    <FaPhone className="me-1" />
                    Call
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </Card.Body>
      
      {showVerification && (
        <Card.Footer className="bg-white">
          <h6 className="mb-3">Verification Status</h6>
          <Row className="text-center g-2">
            <Col xs={4}>
              <div className={`border rounded p-2 ${user.identityVerified ? 'border-success' : ''}`}>
                <FaIdCard 
                  className={user.identityVerified ? "text-success mb-2" : "text-secondary mb-2"} 
                  size={24} 
                />
                <div className="small">Identity</div>
                <Badge bg={user.identityVerified ? "success" : "secondary"} className="mt-1">
                  {user.identityVerified ? "Verified" : "No"}
                </Badge>
              </div>
            </Col>
            
            <Col xs={4}>
              <div className={`border rounded p-2 ${user.phoneVerified ? 'border-success' : ''}`}>
                <FaPhone 
                  className={user.phoneVerified ? "text-success mb-2" : "text-secondary mb-2"} 
                  size={24} 
                />
                <div className="small">Phone</div>
                <Badge bg={user.phoneVerified ? "success" : "secondary"} className="mt-1">
                  {user.phoneVerified ? "Verified" : "No"}
                </Badge>
              </div>
            </Col>
            
            <Col xs={4}>
              <div className={`border rounded p-2 ${user.vehicleVerified ? 'border-success' : ''}`}>
                <FaShieldAlt 
                  className={user.vehicleVerified ? "text-success mb-2" : "text-secondary mb-2"} 
                  size={24} 
                />
                <div className="small">{isDriver ? 'Vehicle' : 'Email'}</div>
                <Badge bg={user.vehicleVerified ? "success" : "secondary"} className="mt-1">
                  {user.vehicleVerified ? "Verified" : "No"}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Footer>
      )}
    </Card>
  );
};

UserProfileCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string,
    bio: PropTypes.string,
    rating: PropTypes.number,
    ratingCount: PropTypes.number,
    joinDate: PropTypes.string,
    address: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    isVerified: PropTypes.bool,
    identityVerified: PropTypes.bool,
    phoneVerified: PropTypes.bool,
    vehicleVerified: PropTypes.bool,
    vehicle: PropTypes.shape({
      model: PropTypes.string,
      color: PropTypes.string,
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'compact', 'horizontal']),
  showActions: PropTypes.bool,
  showRating: PropTypes.bool,
  showContact: PropTypes.bool,
  showVerification: PropTypes.bool,
  isDriver: PropTypes.bool,
  className: PropTypes.string,
  onMessageClick: PropTypes.func,
  onCallClick: PropTypes.func
};

export default UserProfileCard;