import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="py-3">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Community RideShare</h5>
            <p className="mb-3">
              A peer-to-peer ride-sharing platform tailored for local communities, providing cost-effective, 
              transparent, and flexible transportation solutions.
            </p>
            <div className="d-flex gap-3 mb-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaLinkedin size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaGithub size={20} />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/how-it-works" className="text-white text-decoration-none">How It Works</Link>
              </li>
              <li className="mb-2">
                <Link to="/safety" className="text-white text-decoration-none">Safety</Link>
              </li>
              <li className="mb-2">
                <Link to="/careers" className="text-white text-decoration-none">Careers</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/help" className="text-white text-decoration-none">Help Center</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none">Contact Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-white text-decoration-none">FAQ</Link>
              </li>
              <li className="mb-2">
                <Link to="/feedback" className="text-white text-decoration-none">Feedback</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Newsletter</h5>
            <p>Subscribe to our newsletter for the latest updates and offers.</p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Your email" 
                aria-label="Your email" 
              />
              <button className="btn btn-primary" type="button" id="subscribe-button">
                Subscribe
              </button>
            </div>
          </Col>
        </Row>
        
        <hr className="my-3 bg-secondary" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <div>
              &copy; {currentYear} Community RideShare. All rights reserved.
            </div>
          </Col>
          
          <Col md={6} className="text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/terms" className="text-white text-decoration-none">Terms</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/privacy" className="text-white text-decoration-none">Privacy</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/cookies" className="text-white text-decoration-none">Cookies</Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;