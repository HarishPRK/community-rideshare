import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import MapDebugger from '../components/test/MapDebugger';
import MapComponent from '../components/common/MapComponent';

const MapDebugPage = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Google Maps Debugging</h2>
      <p className="text-muted mb-4">
        This page helps troubleshoot issues with Google Maps API integration. It provides diagnostic tools
        and a simple map rendering test to identify any problems with your API key or configuration.
      </p>
      
      <Row>
        <Col lg={6} className="mb-4">
          <MapDebugger />
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Map Rendering Test</Card.Title>
              <Card.Text className="mb-3">
                This section should display a basic Google Map. If you see a map below, your API key and basic
                configuration are working. If you see an error or grey box, there's an issue with your Maps API setup.
              </Card.Text>
              
              <div className="border rounded">
                <MapComponent
                  height="400px"
                  width="100%"
                  center={{ lat: 42.3601, lng: -71.0589 }} // Boston
                  zoom={12}
                  markers={[
                    {
                      id: 'test-marker',
                      position: { lat: 42.3601, lng: -71.0589 },
                      title: 'Test Marker',
                      color: '#dc3545',
                    }
                  ]}
                  showCurrentLocation={true}
                />
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Common Solutions</Card.Title>
              <h6 className="mt-3">If the map doesn't appear:</h6>
              <ol>
                <li>Check if your API key is valid and has the correct permissions</li>
                <li>Ensure that billing is enabled for your Google Cloud project</li>
                <li>Verify that the Maps JavaScript API is enabled in the Google Cloud Console</li>
                <li>Check the browser console for specific error messages</li>
                <li>Try clearing your browser cache or testing in an incognito window</li>
              </ol>
              
              <h6 className="mt-3">If the map shows "For development purposes only":</h6>
              <ol>
                <li>Set up billing for your Google Cloud project</li>
                <li>Wait a few minutes for the billing changes to propagate</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MapDebugPage;
