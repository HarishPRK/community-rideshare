import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaHome, FaArrowLeft } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <div className="display-1 text-muted">404</div>
            <h1 className="mb-3">Page Not Found</h1>
            <p className="lead text-muted mb-4">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="mb-5">
            <img 
              src="/images/404-illustration.svg" 
              alt="Page Not Found" 
              className="img-fluid" 
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button 
              as={Link} 
              to="/" 
              variant="primary" 
              className="d-flex align-items-center"
            >
              <FaHome className="me-2" />
              Back to Home
            </Button>
            
            <Button 
              onClick={() => window.history.back()} 
              variant="outline-secondary"
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Go Back
            </Button>
            
            <Button 
              as={Link} 
              to="/request-ride" 
              variant="outline-primary"
              className="d-flex align-items-center"
            >
              <FaSearch className="me-2" />
              Find a Ride
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;