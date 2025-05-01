import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * GoogleMapsErrorHandler - Handles the "This page can't load Google Maps correctly" error
 * 
 * This component monitors for Google Maps authentication errors and provides a user-friendly
 * error message with helpful information instead of the default error dialog.
 */
const GoogleMapsErrorHandler = () => {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // Function to check for and handle Google Maps error dialog
    const handleGoogleMapsError = () => {
      // Look for Google's error dialog - it has specific styling we can target
      const googleErrorElement = document.querySelector('.dismissButton');
      
      if (googleErrorElement) {
        // If we found the error dialog, show our custom modal instead
        setShowModal(true);
        
        // Try to dismiss Google's error dialog
        try {
          googleErrorElement.click();
        } catch (error) {
          console.error('Failed to dismiss Google Maps error dialog:', error);
        }
        
        // Additional monitoring in case the error reappears
        const observeBody = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              const newErrorElement = document.querySelector('.dismissButton');
              if (newErrorElement) {
                try {
                  newErrorElement.click();
                } catch (error) {
                  console.error('Failed to dismiss new Google Maps error dialog:', error);
                }
              }
            }
          });
        });
        
        // Start observing the body for changes
        observeBody.observe(document.body, { childList: true, subtree: true });
        
        // Cleanup function
        return () => {
          observeBody.disconnect();
        };
      }
    };
    
    // Initial check for Google Maps error
    handleGoogleMapsError();
    
    // Set up an interval to periodically check for the error
    const checkInterval = setInterval(handleGoogleMapsError, 1000);
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(checkInterval);
    };
  }, []);
  
  const handleClose = () => {
    setShowModal(false);
  };
  
  return (
    <Modal show={showModal} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Google Maps Issue Detected</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">
          <Alert.Heading>Maps Not Loading Correctly</Alert.Heading>
          <p>
            We've detected an issue with Google Maps. This is likely due to one of the following:
          </p>
          <ul>
            <li>API key restrictions on your Google Cloud account</li>
            <li>Billing not enabled for Google Maps Platform</li>
            <li>Required Maps APIs not activated</li>
          </ul>
        </Alert>
        <p>
          Our app will continue to function, but map features may be limited. 
          For comprehensive troubleshooting steps, please visit our
          <Link to="/map-test" className="mx-1">Map Diagnostic Page</Link>
          for detailed information.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Continue Without Maps
        </Button>
        <Button variant="primary" as={Link} to="/map-test" onClick={handleClose}>
          Run Diagnostics
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GoogleMapsErrorHandler;
