import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle, FaCarAlt, FaHistory, FaCog } from 'react-icons/fa';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeNavbar = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      sticky="top" 
      expanded={expanded} 
      onToggle={setExpanded}
      className="shadow-sm mb-0"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          {/* Use FaCarAlt icon instead of logo image */}
          <FaCarAlt className="me-2" size={24} />
          <span className="fw-bold">Community RideShare</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" onClick={closeNavbar}>Home</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/request-ride" onClick={closeNavbar}>
                  Request a Ride
                </Nav.Link> 
                
                <Nav.Link as={Link} to="/offer-ride" onClick={closeNavbar}>
                  Offer a Ride
                </Nav.Link>
                
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center">
                    {currentUser?.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser.name}
                        className="rounded-circle me-1"
                        width="24"
                        height="24"
                      />
                    ) : (
                      <FaUserCircle className="me-1" />
                    )}
                    {currentUser?.name || "My Account"}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to="/profile" onClick={closeNavbar}>
                      <FaUserCircle className="me-2" />
                      My Profile
                    </Dropdown.Item>
                    
                    <Dropdown.Item as={Link} to="/ride-history" onClick={closeNavbar}>
                      <FaHistory className="me-2" />
                      Ride History
                    </Dropdown.Item>
                    
                    <Dropdown.Item as={Link} to="/my-offered-rides" onClick={closeNavbar}>
                      <FaCarAlt className="me-2" />
                      My Offered Rides
                    </Dropdown.Item>
                    
                    <Dropdown.Item as={Link} to="/settings" onClick={closeNavbar}>
                      <FaCog className="me-2" />
                      Settings
                    </Dropdown.Item>
                    
                    <Dropdown.Divider />
                    
                    <Dropdown.Item onClick={() => { handleLogout(); closeNavbar(); }}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={closeNavbar}>
                  Login
                </Nav.Link>
                
                <Nav.Item>
                  <Button
                    as={Link}
                    to="/register"
                    variant="outline-light"
                    className="ms-lg-2 mt-2 mt-lg-0"
                    onClick={closeNavbar}
                  >
                    Sign Up
                  </Button>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
