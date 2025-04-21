import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap'; // Added Row, Col
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaCarSide, FaInfoCircle } from 'react-icons/fa'; // Added FaInfoCircle

/**
 * RequestRidePage - Information page that redirects users to find and book available rides
 */
const RequestRidePage = () => {
  const navigate = useNavigate();
  
  // Automatically redirect to search page after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/search');
    }, 5000); // 5 second delay
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <Container className="py-5">
      {/* Apply glass effect directly if desired, or rely on card inheritance */}
      <Card className="shadow-sm text-center mb-4 glass-effect"> 
        <Card.Body className="p-lg-5 p-4"> {/* Responsive padding */}
          <h1 className="mb-4 fw-bold">Request a Ride</h1> {/* Larger title */}
          
          <Alert variant="info" className="d-flex align-items-center mb-5 shadow-sm"> {/* Improved Alert */}
             <FaInfoCircle className="me-3 flex-shrink-0" size={24} />
             <div className="text-start"> {/* Align text left */}
               To request a ride, you need to first search for available rides using the button below, find one that matches your needs, and then select it to send a join request to the driver.
             </div>
          </Alert>
          
          {/* Use Row/Col for better layout */}
          <Row className="mb-5 gy-4"> 
            <Col md={6}>
              <div className="d-flex flex-column align-items-center">
                <div className="mb-3">
                  <FaSearch size={52} className="text-primary" /> {/* Slightly larger icon */}
                </div>
                <h4 className="fw-semibold">1. Find Available Rides</h4> {/* Bolder heading */}
                <p className="text-muted px-md-3"> {/* Added padding */}
                  Browse rides offered by drivers going your way using the search function.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-column align-items-center">
                <div className="mb-3">
                  <FaCarSide size={52} className="text-success" /> {/* Slightly larger icon */}
                </div>
                <h4 className="fw-semibold">2. Join a Ride</h4> {/* Bolder heading */}
                <p className="text-muted px-md-3"> {/* Added padding */}
                  Select a ride that matches your schedule and request to join it.
                </p>
              </div>
            </Col>
          </Row>
          
          <p className="text-muted fst-italic mb-4">Redirecting you to the search page shortly...</p> {/* Styled redirect text */}
          
          <div className="d-grid gap-3"> {/* Increased gap */}
            <Button 
              as={Link}
              to="/search"
              variant="primary" 
              size="lg"
              className="mb-2"
            >
              Search for Rides Now
            </Button>
            
            <Button 
              as={Link}
              to="/offer-ride"
              variant="outline-secondary"
            >
              Offer a Ride Instead
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestRidePage;
