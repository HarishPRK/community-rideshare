import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
<<<<<<< HEAD
=======
    name: '',
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };
  
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  };
  
  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'danger';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };
  
  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };
  
  // Handle next step in form
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate first step
    if (formStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    setError('');
    setFormStep(2);
  };
  
  // Handle back to previous step
  const handleBackStep = () => {
    setError('');
    setFormStep(1);
  };
  
  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Validate phone number format
  const isValidPhone = (phone) => {
    return /^[\d\s()+-]{10,15}$/.test(phone);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter a password and confirmation');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms and Privacy Policy');
      return;
    }
    
    // Submit form
    setLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
<<<<<<< HEAD
=======
        name: formData.firstName + formData.lastName,
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Registration failed');
      }
      
      // Navigate to dashboard on success
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Create an Account</h2>
                <p className="text-muted">Join the Community RideShare platform</p>
              </div>
              
              {/* Progress indicator */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Step {formStep} of 2</span>
                  <span>{formStep === 1 ? 'Personal Info' : 'Security'}</span>
                </div>
                <ProgressBar now={formStep === 1 ? 50 : 100} variant="primary" />
              </div>
              
              {/* Error message */}
              {(error || authError) && (
                <Alert variant="danger" className="mb-4">
                  {error || authError}
                </Alert>
              )}
              
              {/* Registration Form */}
              <Form onSubmit={formStep === 1 ? handleNextStep : handleSubmit}>
                {formStep === 1 ? (
                  // Step 1: Personal Information
                  <>
                    <Row>
                      {/* First Name */}
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
                              placeholder="First name"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      
                      {/* Last Name */}
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
                              placeholder="Last name"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Email */}
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>
                    
                    {/* Phone (Optional) */}
                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number (Optional)</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaPhoneAlt />
                        </span>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="(123) 456-7890"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </Form.Group>
                    
                    {/* Next Button */}
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2"
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  // Step 2: Security Information
                  <>
                    {/* Password */}
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={8}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <ProgressBar 
                            now={passwordStrength} 
                            variant={getStrengthColor()} 
                            className="mb-1"
                          />
                          <small className={`text-${getStrengthColor()}`}>
                            {getStrengthText()}
                          </small>
                        </div>
                      )}
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters long.
                      </Form.Text>
                    </Form.Group>
                    
                    {/* Confirm Password */}
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </Form.Group>
                    
                    {/* Terms Agreement */}
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        label={
                          <span>
                            I agree to the{' '}
                            <Link to="/terms" className="text-decoration-none">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                          </span>
                        }
                        required
                      />
                    </Form.Group>
                    
                    {/* Form Buttons */}
                    <div className="d-flex gap-3">
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleBackStep}
                        className="flex-grow-1 py-2"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="flex-grow-1 py-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner 
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Sign In Link */}
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;