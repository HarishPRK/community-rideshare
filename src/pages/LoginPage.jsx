import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, loginWithGoogle, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect URL from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      // Attempt login
      const result = await login({ 
        email: formData.email, 
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Redirect on success
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (!result.success) {
        throw new Error(result.message || 'Google sign-in failed');
      }
      
      // Redirect on success
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Welcome Back!</h2>
                <p className="text-muted">Sign in to your account to continue</p>
              </div>
              
              {/* Error message */}
              {(error || authError) && (
                <Alert variant="danger" className="mb-4">
                  {error || authError}
                </Alert>
              )}
              
              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
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
                </Form.Group>
                
                {/* Password Field */}
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between">
                    <Form.Label>Password</Form.Label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </Form.Group>
                
                {/* Remember Me Checkbox */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    label="Remember me"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                {/* Submit Button */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-4" 
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
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
                {/* Social Login Options */}
                <div className="text-center mb-4">
                  <p className="text-muted mb-3">Or sign in with</p>
                  <div className="d-flex justify-content-center gap-3">
                    <Button 
                      variant="outline-primary" 
                      className="rounded-circle p-2"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      {loading ? (
                        <Spinner 
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        <FaGoogle />
                      )}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="rounded-circle p-2"
                      disabled={loading}
                    >
                      <FaFacebook />
                    </Button>
                  </div>
                </div>
                
                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-semibold">
                      Sign Up
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

export default LoginPage;
