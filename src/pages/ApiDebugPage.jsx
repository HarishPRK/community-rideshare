import React from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ApiTest from '../components/test/ApiTest';
import AuthDebugger from '../components/test/AuthDebugger';

const ApiDebugPage = () => {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>API Debugging</h1>
          <p className="text-muted">
            This page helps diagnose API and authentication issues with ride offers and requests.
          </p>
          
          <Alert variant="info">
            <Alert.Heading>Debugging 403 Errors</Alert.Heading>
            <p>
              If you're getting 403 errors when offering or requesting rides, this could be due to:
            </p>
            <ol>
              <li><strong>Authentication issues</strong> - Your token might be invalid or missing</li>
              <li><strong>Coordinate format issues</strong> - Backend expects <code>latitude/longitude</code> but frontend might be sending <code>lat/lng</code></li>
              <li><strong>CORS configuration</strong> - The server might be rejecting cross-origin requests</li>
              <li><strong>Backend permission issues</strong> - Your user account might not have the required permissions</li>
            </ol>
            <p>
              The tools below will help diagnose which of these issues is causing your 403 errors.
            </p>
          </Alert>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <AuthDebugger />
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <ApiTest />
        </Col>
      </Row>
      
      <Row>
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Recommended Fixes</h5>
            </Card.Header>
            <Card.Body>
              <h6>Authentication Issues</h6>
              <ul>
                <li>Try logging out and logging back in to get a fresh token</li>
                <li>Check if the token is being correctly stored in localStorage</li>
                <li>Verify if the Authorization header is properly set on requests</li>
              </ul>
              
              <h6>Coordinate Format Issues</h6>
              <ul>
                <li>
                  Make sure coordinates are sent in the correct format:
                  <pre className="bg-light p-2 mt-1">
{`// Correct backend format
{
  "pickupLocation": {
    "address": "...",
    "latitude": 42.2626,
    "longitude": -71.8023
  }
}`}
                  </pre>
                </li>
                <li>Use the API test tool to check which format works with the backend</li>
              </ul>
              
              <h6>CORS Issues</h6>
              <ul>
                <li>Check browser console for CORS-related errors</li>
                <li>Verify backend CORS configuration allows requests from your frontend origin</li>
                <li>Ensure proper headers are allowed in CORS configuration</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Next Steps</h5>
            </Card.Header>
            <Card.Body>
              <p>After identifying the issue using the tools above:</p>
              
              <div className="d-grid gap-2">
                <Button as={Link} to="/offer-ride" variant="primary">
                  Try Offering a Ride Again
                </Button>
                <Button as={Link} to="/request-ride" variant="outline-primary">
                  Try Requesting a Ride
                </Button>
                <Button as={Link} to="/auth-debug" variant="outline-secondary">
                  Go to Auth Debugger
                </Button>
                <Button as={Link} to="/" variant="outline-secondary">
                  Return to Home
                </Button>
              </div>
              
              <hr />
              
              <h6 className="mt-3">Still Having Issues?</h6>
              <p>
                If you're still experiencing 403 errors after trying the fixes above:
              </p>
              <ol>
                <li>Check if your account has admin privileges in the system</li>
                <li>Try creating a different user account</li>
                <li>Check the backend logs for more detailed error messages</li>
                <li>Contact the system administrator</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApiDebugPage;
