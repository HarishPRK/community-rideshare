import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Modal,
  Badge,
  Tab,
  Nav,
  ListGroup
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaCar, 
  FaIdCard, 
  FaRegCalendarAlt,
  FaCamera,
  FaLock,
  FaStar,
  FaUserCheck,
  FaCarAlt,
  FaShieldAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { currentUser, updateProfile, loading: authLoading, error: authError, refreshUserProfile } = useAuth();
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profilePicture: null,
    preferredPaymentMethod: 'cash',
  });
  
  // State for vehicle data
  const [vehicleData, setVehicleData] = useState({
    model: '',
    color: '',
    year: '',
    licensePlate: '',
    seats: 4,
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  // Load current user data into form
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || '',
        profilePicture: null,
        preferredPaymentMethod: currentUser.preferredPaymentMethod || 'cash',
      });
      
      if (currentUser.vehicle) {
        setVehicleData({
          model: currentUser.vehicle.model || '',
          color: currentUser.vehicle.color || '',
          year: currentUser.vehicle.year || '',
          licensePlate: currentUser.vehicle.licensePlate || '',
          seats: currentUser.vehicle.seats || 4,
        });
      }
      
      if (currentUser.profilePictureUrl) {
        setPreviewImage(currentUser.profilePictureUrl);
      }
    }
  }, [currentUser]);
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      // Handle file upload
      if (files && files[0]) {
        const selectedFile = files[0];
        setProfileData({
          ...profileData,
          profilePicture: selectedFile,
        });
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    } else {
      // Handle other form inputs
      setProfileData({
        ...profileData,
        [name]: value,
      });
    }
  };
  
  // Handle vehicle form input changes
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value,
    });
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  // Toggle show/hide password
  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };
  
  // Handle profile update submission
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('bio', profileData.bio);
      formData.append('preferredPaymentMethod', profileData.preferredPaymentMethod);
      
      // Append vehicle data
      formData.append('vehicle', JSON.stringify(vehicleData));
      
      // Add profile picture if selected
      if (profileData.profilePicture) {
        formData.append('profilePicture', profileData.profilePicture);
      }
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Refresh user profile
        refreshUserProfile();
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change submission
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (passwordData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const result = await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (result.success) {
        setSuccess('Password updated successfully!');
        setShowPasswordModal(false);
        
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(result.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.address,
      profileData.bio,
      previewImage,
      vehicleData.model,
      vehicleData.color,
      vehicleData.licensePlate
    ];
    
    const filledFields = fields.filter(field => field && field.trim !== '' && field.length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  // Get completion badge color
  const getCompletionBadgeColor = (percentage) => {
    if (percentage < 50) return 'danger';
    if (percentage < 80) return 'warning';
    return 'success';
  };
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">My Profile</h2>
      
      {/* Success Message */}
      {success && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccess('')}
          className="mb-4"
        >
          {success}
        </Alert>
      )}
      
      {/* Error Message */}
      {(error || authError) && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError('')}
          className="mb-4"
        >
          {error || authError}
        </Alert>
      )}
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div className="position-relative mb-4 d-inline-block">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile" 
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto border"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <FaUser className="text-secondary" size={60} />
                  </div>
                )}
                
                {isEditing && (
                  <div className="position-absolute bottom-0 end-0">
                    <label htmlFor="profile-picture" className="btn btn-primary btn-sm rounded-circle">
                      <FaCamera />
                      <input 
                        type="file" 
                        id="profile-picture" 
                        name="profilePicture"
                        className="d-none"
                        accept="image/*"
                        onChange={handleProfileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
              
              <div className="d-flex justify-content-center mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-2 text-warning">
                    {[...Array(5)].map((_, index) => (
                      <FaStar 
                        key={index}
                        className={index < Math.floor(currentUser?.rating || 0) ? "text-warning" : "text-muted"}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="fw-bold">{currentUser?.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-muted ms-1">({currentUser?.ratingCount || 0} ratings)</span>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-center mb-3">
                <Badge 
                  bg={getCompletionBadgeColor(calculateProfileCompletion())}
                  className="py-2 px-3"
                >
                  Profile {calculateProfileCompletion()}% Complete
                </Badge>
              </div>
              
              <div className="mb-3">
                <p className="text-muted mb-1">
                  <FaRegCalendarAlt className="me-2" />
                  Joined {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p className="text-muted mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  {currentUser?.address || 'Location not specified'}
                </p>
              </div>
              
              <div className="d-grid">
                {!isEditing ? (
                  <Button 
                    variant="primary" 
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaUser className="me-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel Editing
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm mt-4">
            <Card.Body>
              <h5 className="mb-3">Account Settings</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0">
                  <div className="d-flex align-items-center">
                    <FaLock className="text-primary me-3" />
                    <span>Change Password</span>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Update
                  </Button>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0">
                  <div className="d-flex align-items-center">
                    <FaShieldAlt className="text-primary me-3" />
                    <span>Account Verification</span>
                  </div>
                  <Badge bg={currentUser?.verified ? "success" : "warning"}>
                    {currentUser?.verified ? "Verified" : "Pending"}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="personal">
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="personal">Personal Info</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="vehicle">Vehicle Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="preferences">Preferences</Nav.Link>
                  </Nav.Item>
                </Nav>
                
                <Tab.Content>
                  {/* Personal Info Tab */}
                  <Tab.Pane eventKey="personal">
                    <Form onSubmit={handleProfileUpdate}>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>First Name</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaUser />
                              </span>
                              <Form.Control
                                type="text"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleProfileChange}
                                disabled={!isEditing}
                                required
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Last Name</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaUser />
                              </span>
                              <Form.Control
                                type="text"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleProfileChange}
                                disabled={!isEditing}
                                required
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaEnvelope />
                              </span>
                              <Form.Control
                                type="email"
                                name="email"
                                value={profileData.email}
                                disabled
                              />
                            </div>
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Phone Number</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaPhoneAlt />
                              </span>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                disabled={!isEditing}
                                placeholder="e.g., (123) 456-7890"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaMapMarkerAlt />
                          </span>
                          <Form.Control
                            type="text"
                            name="address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            placeholder="Your home or work address"
                          />
                        </div>
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          placeholder="Tell others a bit about yourself"
                        />
                      </Form.Group>
                      
                      {isEditing && (
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="px-4"
                            disabled={loading || authLoading}
                          >
                            {(loading || authLoading) ? (
                              <>
                                <Spinner 
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>
                  
                  {/* Vehicle Tab */}
                  <Tab.Pane eventKey="vehicle">
                    <Form onSubmit={handleProfileUpdate}>
                      <div className="mb-4 pb-2 border-bottom">
                        <h5>Vehicle Information</h5>
                        <p className="text-muted">
                          Add your vehicle details to offer rides to others
                        </p>
                      </div>
                      
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Vehicle Model</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaCar />
                              </span>
                              <Form.Control
                                type="text"
                                name="model"
                                value={vehicleData.model}
                                onChange={handleVehicleChange}
                                disabled={!isEditing}
                                placeholder="e.g., Toyota Camry"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Vehicle Color</Form.Label>
                            <Form.Control
                              type="text"
                              name="color"
                              value={vehicleData.color}
                              onChange={handleVehicleChange}
                              disabled={!isEditing}
                              placeholder="e.g., Silver"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                              type="number"
                              name="year"
                              value={vehicleData.year}
                              onChange={handleVehicleChange}
                              disabled={!isEditing}
                              placeholder="e.g., 2020"
                              min="1990"
                              max={new Date().getFullYear()}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>License Plate</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FaIdCard />
                              </span>
                              <Form.Control
                                type="text"
                                name="licensePlate"
                                value={vehicleData.licensePlate}
                                onChange={handleVehicleChange}
                                disabled={!isEditing}
                                placeholder="e.g., ABC123"
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Number of Seats (excluding driver)</Form.Label>
                        <Form.Control
                          type="number"
                          name="seats"
                          value={vehicleData.seats}
                          onChange={handleVehicleChange}
                          disabled={!isEditing}
                          min="1"
                          max="8"
                        />
                      </Form.Group>
                      
                      {isEditing && (
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="px-4"
                            disabled={loading || authLoading}
                          >
                            {(loading || authLoading) ? (
                              <>
                                <Spinner 
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>
                  
                  {/* Preferences Tab */}
                  <Tab.Pane eventKey="preferences">
                    <Form onSubmit={handleProfileUpdate}>
                      <div className="mb-4 pb-2 border-bottom">
                        <h5>Ride Preferences</h5>
                        <p className="text-muted">
                          Customize your ride experience
                        </p>
                      </div>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Preferred Payment Method</Form.Label>
                        <div className="mb-3">
                          <Form.Check
                            type="radio"
                            id="payment-cash"
                            name="preferredPaymentMethod"
                            value="cash"
                            label="Cash"
                            checked={profileData.preferredPaymentMethod === 'cash'}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="mb-3">
                          <Form.Check
                            type="radio"
                            id="payment-card"
                            name="preferredPaymentMethod"
                            value="card"
                            label="Credit/Debit Card"
                            checked={profileData.preferredPaymentMethod === 'card'}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="mb-3">
                          <Form.Check
                            type="radio"
                            id="payment-online"
                            name="preferredPaymentMethod"
                            value="online"
                            label="Online Payment (PayPal, Venmo, etc.)"
                            checked={profileData.preferredPaymentMethod === 'online'}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Form.Group>
                      
                      <div className="mb-4 pb-2 border-bottom">
                        <h5>Notification Preferences</h5>
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="email-notifications"
                          label="Email Notifications"
                          defaultChecked
                          disabled={!isEditing}
                        />
                        <Form.Text className="text-muted">
                          Receive email notifications about ride updates, new requests, etc.
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Check
                          type="switch"
                          id="sms-notifications"
                          label="SMS Notifications"
                          defaultChecked
                          disabled={!isEditing}
                        />
                        <Form.Text className="text-muted">
                          Receive text messages for important updates about your rides
                        </Form.Text>
                      </Form.Group>
                      
                      {isEditing && (
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="px-4"
                            disabled={loading || authLoading}
                          >
                            {(loading || authLoading) ? (
                              <>
                                <Spinner 
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm mt-4">
            <Card.Body>
              <h5 className="mb-3">Verification Status</h5>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className={`border rounded p-3 text-center ${currentUser?.verified ? 'border-success' : 'border-warning'}`}>
                    <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 ${currentUser?.verified ? 'bg-success' : 'bg-warning'}`} style={{ width: '50px', height: '50px' }}>
                      <FaUserCheck className="text-white" size={20} />
                    </div>
                    <h6>Identity</h6>
                    <Badge bg={currentUser?.verified ? 'success' : 'warning'}>
                      {currentUser?.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="border rounded p-3 text-center">
                    <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 bg-secondary" style={{ width: '50px', height: '50px' }}>
                      <FaPhoneAlt className="text-white" size={20} />
                    </div>
                    <h6>Phone</h6>
                    <Badge bg={currentUser?.phoneVerified ? 'success' : 'secondary'}>
                      {currentUser?.phoneVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3 text-center">
                    <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 bg-secondary" style={{ width: '50px', height: '50px' }}>
                      <FaCarAlt className="text-white" size={20} />
                    </div>
                    <h6>Vehicle</h6>
                    <Badge bg={currentUser?.vehicleVerified ? 'success' : 'secondary'}>
                      {currentUser?.vehicleVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <Form.Control
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => toggleShowPassword('current')}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <Form.Control
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => toggleShowPassword('new')}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Confirm New Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <Form.Control
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => toggleShowPassword('confirm')}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || authLoading}
              >
                {(loading || authLoading) ? (
                  <>
                    <Spinner 
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfilePage;