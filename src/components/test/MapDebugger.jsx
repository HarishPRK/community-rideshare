import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form, ListGroup } from 'react-bootstrap';

const MapDebugger = () => {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '');
  const [loading, setLoading] = useState(false);
  
  // Run basic checks on component mount
  useEffect(() => {
    const basicDiagnostics = {
      apiKeyPresent: !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      apiKeyLength: (process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '').length,
      isWindowGoogleDefined: typeof window.google !== 'undefined',
      isMapsDefined: typeof window.google?.maps !== 'undefined'
    };
    
    setDiagnosticResults(basicDiagnostics);
  }, []);
  
  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      // Simple diagnostics that don't rely on external functions
      const results = {
        apiKeyPresent: !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        apiKeyLength: (process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '').length,
        isWindowGoogleDefined: typeof window.google !== 'undefined',
        isMapsDefined: typeof window.google?.maps !== 'undefined',
        errors: []
      };
      
      // Check localStorage for any stored API key
      const storedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
      if (storedKey) {
        results.usingStoredKey = true;
        results.storedKeyLength = storedKey.length;
      }
      
      // Check for script tags
      const mapScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      results.scriptTagsFound = mapScripts.length > 0;
      
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForceReload = async () => {
    try {
      // Simple reload approach that doesn't rely on external functions
      // 1. Remove any existing Google Maps script tags
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
          console.log('Removed Google Maps script tag');
        }
      });
      
      // 2. Clear Google object if possible
      if (window.google && window.google.maps) {
        try {
          delete window.google.maps;
          console.log('Cleared Google Maps object');
        } catch (e) {
          console.error('Failed to clear Google Maps object:', e);
        }
      }
      
      // 3. Run diagnostics again
      handleRunDiagnostics();
      
      alert('Google Maps scripts removed. Refresh the page to attempt reloading.');
    } catch (error) {
      console.error('Error reloading:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleUpdateAPIKey = () => {
    if (apiKey) {
      localStorage.setItem('GOOGLE_MAPS_API_KEY', apiKey);
      alert('API key saved to localStorage. Refresh the page to use this key.');
    }
  };
  
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title>Google Maps API Debugger (Simplified)</Card.Title>
        
        <div className="mb-4">
          <h5>Current API Status</h5>
          
          {diagnosticResults ? (
            <Alert variant={
              diagnosticResults.isMapsDefined ? "success" : 
              (diagnosticResults.isWindowGoogleDefined ? "warning" : "danger")
            }>
              <div>Google Maps API: {diagnosticResults.isMapsDefined ? "Loaded" : "Not Loaded"}</div>
              <div>API Key: {
                !diagnosticResults.apiKeyPresent ? "Missing" :
                (diagnosticResults.apiKeyLength < 20 ? "Suspicious (too short)" : "Present")
              }</div>
              {diagnosticResults.usingStoredKey && (
                <div>Using stored API key from localStorage</div>
              )}
            </Alert>
          ) : (
            <Alert variant="secondary">Run diagnostics to check API status</Alert>
          )}
        </div>
        
        <div className="d-flex gap-2 mb-4">
          <Button 
            variant="primary" 
            onClick={handleRunDiagnostics}
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
                Running...
              </>
            ) : "Run Diagnostics"}
          </Button>
          
          <Button 
            variant="warning" 
            onClick={handleForceReload}
          >
            Remove Map Scripts
          </Button>
        </div>
        
        {diagnosticResults && (
          <div className="mb-4">
            <h5>Detailed Results</h5>
            <ListGroup>
              <ListGroup.Item>
                <strong>API Key in .env:</strong> {diagnosticResults.apiKeyPresent ? "Yes" : "No"}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>API Key Length:</strong> {diagnosticResults.apiKeyLength} characters
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>window.google Defined:</strong> {diagnosticResults.isWindowGoogleDefined ? "Yes" : "No"}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>window.google.maps Defined:</strong> {diagnosticResults.isMapsDefined ? "Yes" : "No"}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Map Script Tags Found:</strong> {diagnosticResults.scriptTagsFound ? "Yes" : "No"}
              </ListGroup.Item>
              {diagnosticResults.usingStoredKey && (
                <ListGroup.Item>
                  <strong>Stored API Key Length:</strong> {diagnosticResults.storedKeyLength} characters
                </ListGroup.Item>
              )}
            </ListGroup>
          </div>
        )}
        
        <div className="mb-4">
          <h5>Update API Key (For Testing)</h5>
          <Form.Group className="mb-3">
            <Form.Label>Google Maps API Key</Form.Label>
            <Form.Control
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API Key"
            />
            <Form.Text className="text-muted">
              This is for temporary testing only. For permanent changes, update the .env file.
            </Form.Text>
          </Form.Group>
          <Button variant="secondary" onClick={handleUpdateAPIKey}>
            Update API Key (Temporary)
          </Button>
        </div>
        
        <Card.Text className="text-muted">
          For more detailed debugging information, check the browser console and network tabs.
          See also the MAPS_DEBUG.md file for comprehensive troubleshooting steps.
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default MapDebugger;
