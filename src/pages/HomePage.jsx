import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup,
  Carousel
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaCar, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUserFriends, 
  FaStar, 
  FaMoneyBillWave, 
  FaShieldAlt,
  FaUser 
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
    }
  };
  
  // Features data
  const features = [
    {
      icon: <FaUserFriends className="text-primary mb-3" size={48} />,
      title: 'Community-Based',
      description: 'Connect with people in your local community for ride sharing and build meaningful connections.'
    },
    {
      icon: <FaMoneyBillWave className="text-primary mb-3" size={48} />,
      title: 'Fair Pricing',
      description: 'No hidden fees or surge pricing. Set your own fair rates or find affordable rides near you.'
    },
    {
      icon: <FaShieldAlt className="text-primary mb-3" size={48} />,
      title: 'Safety First',
      description: 'Verified users, ratings, and reviews help ensure a safe and trustworthy experience.'
    }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      // Using a placeholder instead of image
      author: "Sarah Johnson",
      quote: "Community RideShare has changed how I commute. I've saved money and made new friends in my neighborhood!",
      role: "Regular Rider"
    },
    {
      // Using a placeholder instead of image
      author: "Michael Chen",
      quote: "As a driver, I love the flexibility and the ability to help my community while offsetting my travel costs.",
      role: "Driver"
    },
    {
      // Using a placeholder instead of image
      author: "Priya Patel",
      quote: "The transparency is refreshing. No surprise fees, just fair pricing and reliable community members.",
      role: "Community Organizer"
    }
  ];
  
  // How it works steps
  const steps = [
    {
      icon: <FaMapMarkerAlt className="text-white" size={24} />,
      title: "Set Your Location",
      description: "Enter your starting point and destination to find available rides or offer your own."
    },
    {
      icon: <FaCalendarAlt className="text-white" size={24} />,
      title: "Choose Your Schedule",
      description: "Select your preferred date and time for travel convenience."
    },
    {
      icon: <FaCar className="text-white" size={24} />,
      title: "Match & Ride",
      description: "Connect with community members, confirm details, and enjoy your shared journey."
    },
    {
      icon: <FaStar className="text-white" size={24} />,
      title: "Rate & Review",
      description: "Share your experience to help build a trusted community network."
    }
  ];
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div 
<<<<<<< HEAD
        className="hero-section py-5 bg-primary text-white position-relative"
=======
        className="hero-section bg-primary text-white position-relative"
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
        style={{
          background: `linear-gradient(rgba(0, 123, 255, 0.8), rgba(0, 123, 255, 0.9))`,
          minHeight: '500px'
        }}
      >
<<<<<<< HEAD
        <Container className="py-5">
          <Row className="align-items-center py-5">
=======
        <Container className="pb-5">
          <Row className="align-items-center pb-4">
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4">Community-Driven<br />Ride Sharing</h1>
              <p className="lead mb-4">
                Connect with your local community for affordable, transparent, and flexible rides. Share the journey, split the costs, build connections.
              </p>
              
              {isAuthenticated ? (
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button 
                    as={Link} 
                    to="/request-ride" 
                    variant="light" 
                    size="lg" 
                    className="fw-bold"
                  >
                    Request a Ride
                  </Button>
                  <Button 
                    as={Link} 
                    to="/offer-ride" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-bold"
                  >
                    Offer a Ride
                  </Button>
                </div>
              ) : (
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="light" 
                    size="lg" 
                    className="fw-bold"
                  >
                    Join Now
                  </Button>
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-bold"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </Col>
            
            <Col lg={6} className="mt-5 mt-lg-0">
              <Card className="shadow">
                <Card.Body className="p-4">
                  <h3 className="text-dark mb-4">Find a Ride Nearby</h3>
                  <Form onSubmit={handleSearch}>
                    <InputGroup className="mb-3">
<<<<<<< HEAD
                      <InputGroup.Text>
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Enter your location"
=======
                      <InputGroup.Text className="bg-primary text-white">
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Enter your starting point"
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        required
                      />
                    </InputGroup>
<<<<<<< HEAD
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
=======
                    
                    <InputGroup className="mb-3">
                      <InputGroup.Text className="bg-success text-white">
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Enter your destination"
                        required
                      />
                    </InputGroup>
                    
                    {/* Google Maps Preview */}
                    <div className="mb-3 rounded overflow-hidden shadow-sm" style={{ height: '200px', position: 'relative' }}>
                    {/* Map Preview */}
                    <div className="bg-light h-100 w-100 d-flex align-items-center justify-content-center">
                      <div className="position-relative w-100 h-100">
                        <div className="w-100 h-100 bg-light" style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=12&size=600x400&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        </div>
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <Button variant="light" className="shadow-sm">
                              <span className="d-flex align-items-center">
                                <FaMapMarkerAlt className="text-danger me-2" />
                                Click to set locations on map
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
                    >
                      <FaSearch />
                      Search Available Rides
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Why Choose Community RideShare?</h2>
            <p className="lead text-muted">Rethinking ride sharing for local communities</p>
          </div>
          
          <Row>
            {features.map((feature, index) => (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="h-100 shadow-sm border-0 text-center p-4">
                  <Card.Body>
                    <div>{feature.icon}</div>
                    <h3 className="h4 mb-3">{feature.title}</h3>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works-section py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">How It Works</h2>
            <p className="lead text-muted">Simple steps to get started with community ride sharing</p>
          </div>
          
          <Row className="gy-4">
            {steps.map((step, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary mb-3" style={{ width: 80, height: 80 }}>
                    {step.icon}
                  </div>
                  <h3 className="h5 mb-2 text-center">{step.title}</h3>
                  <p className="text-muted text-center">{step.description}</p>
                </div>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-5">
            <Button 
              as={Link} 
              to="/how-it-works" 
              variant="outline-primary" 
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </Container>
      </section>
      
      {/* Testimonials Section */}
<<<<<<< HEAD
      <section className="testimonials-section py-5">
=======
      <section className="testimonials-section py-5" style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">What Our Community Says</h2>
            <p className="lead text-muted">Real experiences from our users</p>
          </div>
          
          <Carousel 
<<<<<<< HEAD
            indicators={true} 
            className="testimonial-carousel bg-white p-4 shadow-sm rounded"
          >
            {testimonials.map((testimonial, index) => (
              <Carousel.Item key={index} className="p-3">
                <Row className="align-items-center">
                  <Col md={4} className="text-center mb-4 mb-md-0">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style={{ width: 150, height: 150 }}>
                      <FaUser className="text-primary" size={60} />
                    </div>
                  </Col>
                  <Col md={8}>
                    <blockquote className="blockquote">
                      <p className="mb-4 fs-5">"{testimonial.quote}"</p>
                      <footer className="blockquote-footer">
                        <strong>{testimonial.author}</strong>, {testimonial.role}
                      </footer>
                    </blockquote>
                  </Col>
                </Row>
=======
            indicators={true}
            className="testimonial-carousel shadow rounded"
            prevIcon={<span className="carousel-control-prev-icon" style={{ filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.3))' }} />}
            nextIcon={<span className="carousel-control-next-icon" style={{ filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.3))' }} />}
          >
            {testimonials.map((testimonial, index) => (
              <Carousel.Item key={index}>
                <div className="bg-white p-5 mx-md-5 rounded-lg shadow-sm">
                  <Row className="align-items-center">
                    <Col lg={3} md={4} className="text-center mb-4 mb-md-0">
                      <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto shadow-sm" 
                           style={{ width: 120, height: 120, border: '5px solid white' }}>
                        <FaUser className="text-primary" size={50} />
                      </div>
                    </Col>
                    <Col lg={9} md={8}>
                      <div className="ps-md-4">
                        <blockquote className="blockquote mb-4">
                          <p className="fs-5 fw-light fst-italic text-dark mb-3" style={{ lineHeight: '1.7' }}>
                            "{testimonial.quote}"
                          </p>
                        </blockquote>
                        <div className="d-flex align-items-center">
                          <div className="bg-light px-3 py-2 rounded-pill">
                            <strong className="fw-bold text-primary">{testimonial.author}</strong>
                            <span className="text-muted ms-2">|</span>
                            <span className="text-muted ms-2">{testimonial.role}</span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container className="text-center py-4">
          <h2 className="display-5 fw-bold mb-4">Ready to Join Our Community?</h2>
          <p className="lead mb-4">
            Start sharing rides with your local community members today!
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <>
                <Button 
                  as={Link} 
                  to="/request-ride" 
                  variant="light" 
                  size="lg" 
                  className="fw-bold"
                >
                  Request a Ride
                </Button>
                <Button 
                  as={Link} 
                  to="/offer-ride" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-bold"
                >
                  Offer a Ride
                </Button>
              </>
            ) : (
              <>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light" 
                  size="lg" 
                  className="fw-bold"
                >
                  Sign Up Now
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-bold"
                >
                  Learn More
                </Button>
              </>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
