import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import apiDebugger from '../../utils/apiDebugger';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('auth');
  const [error, setError] = useState(null);

  // Test authentication by fetching user profile
  const runAuthTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      const result = await apiDebugger.testAuthentication();
      setTestResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test ride offer with both coordinate formats to determine which is working
  const runRideOfferTest = async (useLatLng) => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      const result = await apiDebugger.testOfferRide(useLatLng);
      setTestResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check CORS configuration
  const runCorsTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      const result = await apiDebugger.testCors();
      setTestResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom endpoint test
  const runCustomTest = async (endpoint, method, data) => {
    setLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      const result = await apiDebugger.testApiRequest(endpoint, method, data);
      setTestResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render the test response in a nice format
  const renderTestResults = () => {
    if (!testResults) return null;
    
    const isSuccess = testResults.success;
    
    return (
      <div className="mt-3">
        <Alert variant={isSuccess ? "success" : "danger"}>
          <Alert.Heading>
            {isSuccess ? "Test Passed ✅" : "Test Failed ❌"}
          </Alert.Heading>
          <p>
            {isSuccess 
              ? "The API request completed successfully." 
              : "The API request failed. See details below."}
          </p>
        </Alert>
        
        <div className="mt-3">
          <h6>Request Details</h6>
          <pre className="bg-light p-2 border rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(testResults.request, null, 2)}
          </pre>
        </div>
        
        {isSuccess ? (
          <div className="mt-3">
            <h6>Response (Status: {testResults.response.status})</h6>
            <pre className="bg-light p-2 border rounded" style={{ maxHeight: '250px', overflow: 'auto' }}>
              {JSON.stringify(testResults.response.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mt-3">
            <h6>Error (Status: {testResults.error?.status || 'Unknown'})</h6>
            <p className="text-danger">{testResults.error?.message}</p>
            <pre className="bg-light p-2 border rounded" style={{ maxHeight: '250px', overflow: 'auto' }}>
              {JSON.stringify(testResults.error?.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">API Testing Tool</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Tabs
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key)}
          className="mb-3"
        >
          <Tab eventKey="auth" title="Authentication">
            <p>
              Test if your authentication token is working by fetching your user profile.
            </p>
            <Button 
              variant="primary" 
              onClick={runAuthTest} 
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
                  Testing...
                </>
              ) : "Test Authentication"}
            </Button>
          </Tab>
          
          <Tab eventKey="rideOffer" title="Ride Offer">
            <p>
              Test offering a ride with different coordinate formats to see which one works.
              This helps diagnose if the 403 error is due to payload format.
            </p>
            <div className="d-flex gap-2">
              <Button 
                variant="success" 
                onClick={() => runRideOfferTest(false)} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    Test with <code>latitude/longitude</code> format
                    <Badge bg="info" className="ms-2">Backend Format</Badge>
                  </>
                )}
              </Button>
              
              <Button 
                variant="warning" 
                onClick={() => runRideOfferTest(true)} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    Test with <code>lat/lng</code> format
                    <Badge bg="info" className="ms-2">Frontend Format</Badge>
                  </>
                )}
              </Button>
            </div>
          </Tab>
          
          <Tab eventKey="cors" title="CORS">
            <p>
              Test if CORS is configured correctly for ride offer requests.
            </p>
            <Button 
              variant="primary" 
              onClick={runCorsTest} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Testing...
                </>
              ) : "Test CORS Configuration"}
            </Button>
          </Tab>
          
          <Tab eventKey="custom" title="Custom Test">
            <p>
              Run a custom API test against any endpoint.
            </p>
            <div className="mb-3">
              <label className="mb-1">Try these examples:</label>
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={() => runCustomTest('users/profile', 'GET')}
                  disabled={loading}
                >
                  GET /users/profile
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={() => runCustomTest('rides/available', 'GET')}
                  disabled={loading}
                >
                  GET /rides/available
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={() => runCustomTest('rides/offered', 'GET')}
                  disabled={loading}
                >
                  GET /rides/offered
                </Button>
              </div>
            </div>
          </Tab>
        </Tabs>
        
        {renderTestResults()}
      </Card.Body>
    </Card>
  );
};

export default ApiTest;
