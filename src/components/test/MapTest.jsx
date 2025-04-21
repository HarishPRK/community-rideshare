import React, { useEffect, useState } from 'react';
import { Card, Alert, Button, ListGroup } from 'react-bootstrap';
import { getGoogleMapsApiKey, getGoogleMapsErrorMessage, getGoogleMapsTroubleshootingSteps } from '../../utils/mapUtils';
import { loadGoogleMapsScript, isGoogleMapsApiLoaded } from '../../utils/googleMapsLoader';

const MapTest = () => {
  const [apiKeyInfo, setApiKeyInfo] = useState({ apiKey: '', isValid: false });
  const [isKeyLoaded, setIsKeyLoaded] = useState(isGoogleMapsApiLoaded());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [troubleshootingSteps, setTroubleshootingSteps] = useState([]);

  useEffect(() => {
    // Get the API key using our utility function
    const keyInfo = getGoogleMapsApiKey();
    setApiKeyInfo(keyInfo);
    
    // Test if the API key is loaded
    if (!keyInfo.isValid) {
      setError('Google Maps API key is not loaded from environment variables or appears invalid');
      setIsLoading(false);
      setTroubleshootingSteps(getGoogleMapsTroubleshootingSteps());
      return;
    }

    // If Google Maps is already loaded, update state accordingly
    if (isGoogleMapsApiLoaded()) {
      setIsKeyLoaded(true);
      setIsLoading(false);
      return;
    }

    // Otherwise, load Google Maps using our utility
    loadGoogleMapsScript({ libraries: ['places'] })
      .then(() => {
        console.log('MapTest - Google Maps loaded successfully');
        setIsKeyLoaded(true);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('MapTest - Google Maps failed to load:', err);
        setError('Failed to load Google Maps API. See console for details.');
        setTroubleshootingSteps(getGoogleMapsTroubleshootingSteps(err));
        setIsLoading(false);
      });
  }, []);

  return (
    <Card className="shadow-sm my-4">
      <Card.Body>
        <h4 className="mb-3">Google Maps API Test</h4>
        
        {isLoading ? (
          <Alert variant="info">Testing Google Maps API key...</Alert>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{getGoogleMapsErrorMessage(error)}</p>
            <hr />
            <p className="mb-0">
              API Key Status: {apiKeyInfo.isValid ? 'Valid format' : 'Invalid or missing'}
            </p>
            <p className="mb-0">
              API Key: {apiKeyInfo.apiKey ? `${apiKeyInfo.apiKey.substring(0, 6)}...` : 'Not found'}
            </p>
          </Alert>
        ) : isKeyLoaded ? (
          <Alert variant="success">
            <Alert.Heading>Success!</Alert.Heading>
            <p>Google Maps API key is valid and loading correctly.</p>
            <hr />
            <p className="mb-0">
              API Key: {apiKeyInfo.apiKey ? `${apiKeyInfo.apiKey.substring(0, 6)}...` : 'Not found'}
            </p>
          </Alert>
        ) : (
          <Alert variant="warning">
            <Alert.Heading>Unknown Status</Alert.Heading>
            <p>Could not determine if the API key is valid.</p>
          </Alert>
        )}
        
        <div className="mt-3">
          <h5>Environment Information:</h5>
          <Card className="mb-3">
            <Card.Body>
              <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>API Key Present:</strong> {apiKeyInfo.apiKey ? 'Yes' : 'No'}</p>
              <p><strong>API Key Format Valid:</strong> {apiKeyInfo.isValid ? 'Yes' : 'No'}</p>
              <p><strong>API Loaded Successfully:</strong> {isKeyLoaded ? 'Yes' : 'No'}</p>
            </Card.Body>
          </Card>
          
          <h5>Troubleshooting Steps:</h5>
          <ListGroup variant="flush" className="border rounded mb-3">
            {troubleshootingSteps.length > 0 ? (
              troubleshootingSteps.map((step, index) => (
                <ListGroup.Item key={index}>{step}</ListGroup.Item>
              ))
            ) : (
              <>
                <ListGroup.Item>Ensure the .env file is in the root directory of your project</ListGroup.Item>
                <ListGroup.Item>Make sure the environment variable is prefixed with REACT_APP_</ListGroup.Item>
                <ListGroup.Item>Restart the development server after making changes to .env</ListGroup.Item>
                <ListGroup.Item>Check if the API key has domain restrictions in Google Cloud Console</ListGroup.Item>
                <ListGroup.Item>Verify billing is enabled for the Google Maps Platform</ListGroup.Item>
                <ListGroup.Item>Ensure the required APIs (Maps JavaScript API, Places API) are enabled</ListGroup.Item>
              </>
            )}
          </ListGroup>
          
          <div className="d-grid">
            <Button 
              variant="primary"
              onClick={() => window.open('https://console.cloud.google.com/google/maps-apis/overview', '_blank')}
            >
              Go to Google Cloud Console
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MapTest;
