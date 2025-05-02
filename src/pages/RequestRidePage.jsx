import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const RequestRidePage = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Request a Ride</h2>
      <Card className="shadow-sm text-center p-4">
        <Card.Body>
          <div className="mb-3">
            <FaSearch size={48} className="text-muted" />
          </div>
          <h4>Looking for a Ride?</h4>
          <p className="text-muted mb-4">
            The best way to find a ride is to search for rides already offered by drivers in the community.
          </p>
          <Button as={Link} to="/search" variant="primary" size="lg">
            <FaSearch className="me-2" />
            Search for Available Rides
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestRidePage;
