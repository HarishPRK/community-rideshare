import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  InputGroup, 
  ListGroup,
  Badge,
  Collapse,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave, 
  FaFilter,
  FaCar,
  FaStar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExchangeAlt
} from 'react-icons/fa';
import { useRide } from '../contexts/RideContext';
import { useAuth } from '../contexts/AuthContext';
import GoogleMapsSingleton from '../utils/googleMapsSingleton';
import { getGoogleMapsApiKey } from '../utils/mapUtils';

const SearchRidesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchRides, loading: rideLoading, error: rideError } = useRide();
  const { isAuthenticated } = useAuth();
  
  // Parse URL search params
  const queryParams = new URLSearchParams(location.search);
  const locationParam = queryParams.get('location') || '';
  
  // Google Maps state
  const [isLoaded, setIsLoaded] = useState(GoogleMapsSingleton.isLoaded());
  const [loadError, setLoadError] = useState(null);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!isLoaded) {
      // Get API key
      const { apiKey, isValid } = getGoogleMapsApiKey();
      
      if (!isValid) {
        setLoadError(new Error('Google Maps API key is missing or invalid'));
        return;
      }
      
      // Initialize the singleton with the API key
      GoogleMapsSingleton.init(apiKey);
      
      // Load Google Maps
      GoogleMapsSingleton.load()
        .then(() => {
          console.log('SearchRidesPage: Google Maps loaded successfully');
          setIsLoaded(true);
        })
        .catch(error => {
          console.error('SearchRidesPage: Failed to load Google Maps:', error);
          setLoadError(error);
        });
    }
  }, [isLoaded]);
  
  // Search states
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useState({
    location: locationParam,
    departure: '',
    radius: 25, // in miles
    passengers: 1,
    maxPrice: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'departureDate',
    direction: 'asc'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  // Search for rides when location changes in URL
  useEffect(() => {
    if (locationParam) {
      setSearchParams(prev => ({ ...prev, location: locationParam }));
      handleSearch();
    }
  }, [locationParam]);
  
  // Initialize autocomplete when the component mounts
  useEffect(() => {
    if (isLoaded && window.google) {
      const input = document.getElementById('location-input');
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setSearchParams(prev => ({ ...prev, location: place.formatted_address }));
          }
        });
      }
    }
  }, [isLoaded]);
  
  // Format date for display (Corrected to handle potential timezone issues)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Split the date string 'YYYY-MM-DD'
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      // Fallback for unexpected format
      return dateString; 
    }
    // Create date using year, month (0-indexed), day to treat as local
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day); 
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Handle search form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };
  
  // Handle ride sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  // Sort search results
  const sortedResults = useCallback(() => {
    if (!searchResults || searchResults.length === 0) return [];
    
    return [...searchResults].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Special handling for nested properties or dates
      if (sortConfig.key === 'departureDate') {
        aValue = new Date(`${a.departureDate}T${a.departureTime}`);
        bValue = new Date(`${b.departureDate}T${b.departureTime}`);
      } else if (sortConfig.key === 'price') {
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
      } else if (sortConfig.key === 'driver') {
        aValue = a.driver?.name || '';
        bValue = b.driver?.name || '';
      } else if (sortConfig.key === 'driverRating') {
        aValue = a.driver?.rating || 0;
        bValue = b.driver?.rating || 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [searchResults, sortConfig]);
  
  // Handle search form submission
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchParams.location) {
      setError('Please enter a location to search for rides');
      return;
    }
    
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchParams.location) params.set('location', searchParams.location);
    navigate({ search: params.toString() });
    
    setLoading(true);
    setError('');
    
    try {
      const searchCriteria = {
        location: searchParams.location,
        departureDate: searchParams.departure,
        radius: searchParams.radius,
        passengers: searchParams.passengers,
        maxPrice: searchParams.maxPrice || undefined,
      };
      
      const result = await searchRides(searchCriteria);
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        throw new Error(result.message || 'Failed to search for rides');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle map marker click
  const handleMarkerClick = (ride) => {
    setSelectedRide(ride);
  };
  
  // Render map
  const renderMap = () => {
    if (!isLoaded) {
      return (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }
    
    if (loadError) {
      return (
        <Alert variant="danger">
          Error loading maps: {loadError.message || 'Unknown error. Please try again later.'}
        </Alert>
      );
    }
    
    // Default center if no results
    let center = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
    
    // Center on first result if available
    if (searchResults.length > 0 && searchResults[0].pickupLocation) {
      center = {
        lat: searchResults[0].pickupLocation.latitude,
        lng: searchResults[0].pickupLocation.longitude
      };
    }
    
    return (
      <div className="map-container" style={{ height: '600px', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={10}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Render markers for each ride */}
          {searchResults.map((ride) => (
            <Marker
              key={ride.id}
              position={{
                lat: ride.pickupLocation.latitude,
                lng: ride.pickupLocation.longitude
              }}
              onClick={() => handleMarkerClick(ride)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          ))}
          
          {/* InfoWindow for selected ride */}
          {selectedRide && (
            <InfoWindow
              position={{
                lat: selectedRide.pickupLocation.latitude,
                lng: selectedRide.pickupLocation.longitude
              }}
              onCloseClick={() => setSelectedRide(null)}
            >
              <div style={{ width: '250px' }}>
                <h6 className="mb-1">Ride by {selectedRide.driver?.name || 'Driver'}</h6>
                <div className="mb-2 small d-flex align-items-center">
                  <div className="text-warning me-1">
                    <FaStar />
                  </div>
                  <span>{selectedRide.driver?.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="small mb-1">
                  <div className="d-flex">
                    <div className="me-2">
                      <FaMapMarkerAlt className="text-success" />
                    </div>
                    <div className="text-truncate">
                      <strong>From:</strong> {selectedRide.pickupLocation.address}
                    </div>
                  </div>
                </div>
                <div className="small mb-1">
                  <div className="d-flex">
                    <div className="me-2">
                      <FaMapMarkerAlt className="text-danger" />
                    </div>
                    <div className="text-truncate">
                      <strong>To:</strong> {selectedRide.dropoffLocation.address}
                    </div>
                  </div>
                </div>
                <div className="small mb-2">
                  <FaCalendarAlt className="me-1" />
                  {formatDate(selectedRide.departureDate)} at {selectedRide.departureTime}
                </div>
                <div className="small mb-2">
                  <FaMoneyBillWave className="me-1 text-success" />
                  ${selectedRide.price.toFixed(2)}
                </div>
                <Link to={`/rides/${selectedRide.id}`} className="btn btn-sm btn-primary w-100">
                  View Details
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    );
  };
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Find Available Rides</h2>
      
      {/* Search Form */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end">
              <Col lg={5} md={6} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaMapMarkerAlt />
                    </InputGroup.Text>
                    <Form.Control
                      id="location-input"
                      type="text"
                      name="location"
                      placeholder="Enter pickup or destination location"
                      value={searchParams.location}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col lg={3} md={6} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label>Departure Date</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="departure"
                      value={searchParams.departure}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col lg={2} md={6} className="mb-3 mb-lg-0">
                <Form.Group>
                  <Form.Label>Passengers</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUserFriends />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="passengers"
                      value={searchParams.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="8"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col lg={2} md={6} className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="d-flex align-items-center justify-content-center"
                  disabled={loading || rideLoading}
                >
                  {(loading || rideLoading) ? (
                    <>
                      <Spinner 
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="me-2" />
                      Search
                    </>
                  )}
                </Button>
              </Col>
            </Row>
            
            <div className="mt-3">
              <Button
                variant="link"
                className="p-0 text-decoration-none d-flex align-items-center"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
              >
                <FaFilter className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
              </Button>
              
              <Collapse in={showFilters}>
                <div className="mt-3">
                  <Row>
                    <Col md={6} lg={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Distance Radius (miles)</Form.Label>
                        <Form.Control
                          type="range"
                          name="radius"
                          value={searchParams.radius}
                          onChange={handleInputChange}
                          min="5"
                          max="100"
                          step="5"
                        />
                        <div className="d-flex justify-content-between">
                          <small>5 miles</small>
                          <small>{searchParams.radius} miles</small>
                          <small>100 miles</small>
                        </div>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6} lg={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Maximum Price ($)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaMoneyBillWave />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="maxPrice"
                            value={searchParams.maxPrice}
                            onChange={handleInputChange}
                            placeholder="Any price"
                            min="1"
                            step="1"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Collapse>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Error Message */}
      {(error || rideError) && (
        <Alert variant="danger" className="mb-4">
          {error || rideError}
        </Alert>
      )}
      
      {/* Results Section */}
      {!loading && searchResults.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{searchResults.length} Rides Found</h4>
            
            <div className="d-flex gap-2">
              {/* View Mode Toggle */}
              <div className="btn-group">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('map')}
                >
                  Map
                </Button>
              </div>
              
              {/* Sort Dropdown */}
              <DropdownButton
                variant="outline-secondary"
                title={
                  <div className="d-flex align-items-center">
                    <FaSort className="me-2" />
                    Sort
                  </div>
                }
                align="end"
              >
                <Dropdown.Item onClick={() => requestSort('departureDate')}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Departure Date</span>
                    {getSortIcon('departureDate')}
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => requestSort('price')}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Price</span>
                    {getSortIcon('price')}
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => requestSort('driverRating')}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Driver Rating</span>
                    {getSortIcon('driverRating')}
                  </div>
                </Dropdown.Item>
              </DropdownButton>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            <ListGroup>
              {sortedResults().map((ride) => (
                <ListGroup.Item key={ride.id} className="p-3 mb-2 border rounded shadow-sm">
                  <Row>
                    <Col md={8}>
                      <div className="d-flex mb-3">
                        <div className="text-center me-3">
                          <div className="fw-bold">
                            {formatDate(ride.departureDate)}
                          </div>
                          <div className="small text-muted">
                            {ride.departureTime}
                          </div>
                        </div>
                        
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-start mb-2">
                            <div>
                              <Badge bg="success" className="p-1 rounded-circle">
                                <FaMapMarkerAlt className="m-1" />
                              </Badge>
                            </div>
                            <div className="border-start ps-2 ms-2 flex-grow-1">
                              <div className="text-muted small">Pickup</div>
                              <div>{ride.pickupLocation.address}</div>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-start">
                            <div>
                              <Badge bg="danger" className="p-1 rounded-circle">
                                <FaMapMarkerAlt className="m-1" />
                              </Badge>
                            </div>
                            <div className="border-start ps-2 ms-2 flex-grow-1">
                              <div className="text-muted small">Dropoff</div>
                              <div>{ride.dropoffLocation.address}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex flex-wrap gap-3">
                        <div>
                          <div className="text-muted small">Price</div>
                          <div className="d-flex align-items-center">
                            <FaMoneyBillWave className="text-success me-1" />
                            <span className="fw-bold">${ride.price.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted small">Available Seats</div>
                          <div className="d-flex align-items-center">
                            <FaUserFriends className="text-primary me-1" />
                            <span>{ride.maxPassengers - (ride.passengers || 0)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted small">Distance</div>
                          <div>{ride.distance || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <div className="text-muted small">Duration</div>
                          <div>{ride.duration || 'N/A'}</div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={4} className="d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          {ride.driver?.profilePicture ? (
                            <img 
                              src={ride.driver.profilePicture} 
                              alt="Driver" 
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <FaCar className="text-white" />
                            </div>
                          )}
                          <div>
                            <div>{ride.driver?.name || 'Driver'}</div>
                            <div className="d-flex align-items-center">
                              <FaStar className="text-warning me-1" />
                              <span>{ride.driver?.rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-muted ms-1">
                                ({ride.driver?.ratingCount || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {ride.vehicle && (
                          <div className="small mb-3">
                            <div className="d-flex align-items-center text-muted">
                              <FaCar className="me-1" />
                              <span>
                                {ride.vehicle.color} {ride.vehicle.model}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-md-auto">
                        {isAuthenticated ? (
                          <Link 
                            to={`/rides/${ride.id}`} 
                            className="btn btn-primary w-100"
                          >
                            View Details
                          </Link>
                        ) : (
                          <Link 
                            to="/login" 
                            state={{ from: location }} 
                            className="btn btn-primary w-100"
                          >
                            Login to Book
                          </Link>
                        )}
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            renderMap()
          )}
        </div>
      )}
      
      {/* No Results */}
      {!loading && searchResults.length === 0 && searchParams.location && (
        <Card className="shadow-sm text-center p-4">
          <Card.Body>
            <div className="mb-3">
              <FaSearch size={48} className="text-muted" />
            </div>
            <h4>No Rides Found</h4>
            <p className="text-muted mb-4">
              We couldn't find any rides matching your search criteria.
              Try adjusting your filters or searching for a different location.
            </p>
            {isAuthenticated && (
              <div>
                <p>Would you like to offer a ride on this route instead?</p>
                <Button 
                  as={Link} 
                  to={`/offer-ride?location=${encodeURIComponent(searchParams.location)}`}
                  variant="outline-primary"
                >
                  <FaExchangeAlt className="me-2" />
                  Offer a Ride
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Loading State */}
      {(loading || rideLoading) && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Searching for rides...</p>
        </div>
      )}
    </Container>
  );
};

export default SearchRidesPage;
