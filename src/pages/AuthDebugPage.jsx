import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthDebugger from '../components/test/AuthDebugger';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugPage = () => {
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Authentication Debugging</h1>
          <p className="text-muted">
            This page helps diagnose authentication issues with the Community RideShare application.
          </p>
          
          {!isAuthenticated && (
            <Alert variant="warning">
              <Alert.Heading>Not Authenticated</Alert.Heading>
              <p>
                You are currently not authenticated. To test ride offers, you need to log in first.
              </p>
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="primary">
                  Go to Login
                </Button>
                <Button as={Link} to="/register" variant="outline-primary">
                  Register New Account
                </Button>
              </div>
            </Alert>
          )}
          
          {isAuthenticated && (
            <Alert variant="success">
              <Alert.Heading>Currently Authenticated</Alert.Heading>
              <p>
                You are logged in as {currentUser?.email}. Your authentication token should be valid for API requests.
              </p>
            </Alert>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <AuthDebugger />
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Common Issues</h5>
            </Card.Header>
            <Card.Body>
              <h6>Why am I getting a 403 error?</h6>
              <p>
                A 403 error typically indicates an authorization problem:
              </p>
              <ul>
                <li>The token might be missing from the request header</li>
                <li>The token might be expired or invalid</li>
                <li>The user might not have permission for the requested action</li>
                <li>CORS might be blocking the request</li>
              </ul>
              
              <h6>Debugging Steps</h6>
              <ol>
                <li>Check if you're logged in and the token is present</li>
                <li>Try logging out and logging back in to get a fresh token</li>
                <li>Check browser console for any CORS-related errors</li>
                <li>Ensure backend security configuration allows the action</li>
              </ol>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/offer-ride" variant="primary">
                  Try Offering a Ride
                </Button>
                <Button as={Link} to="/request-ride" variant="outline-primary">
                  Try Requesting a Ride
                </Button>
                <Button as={Link} to="/" variant="outline-secondary">
                  Return to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthDebugPage;
