import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  InputGroup, 
  Collapse, 
  Badge 
} from 'react-bootstrap';
import { 
  FaFilter, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaMoneyBillWave,
  FaStar, 
  FaAngleDown, 
  FaAngleUp, 
  FaTrash, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaExchangeAlt
} from 'react-icons/fa';

/**
 * RideFilter - A component for filtering ride search results
 * 
 * Features:
 * - Filter by date, time, price, ratings
 * - Sort results by different criteria
 * - Save filter presets for quick access
 */
const RideFilter = ({
  filters = {},
  onFilterChange,
  onClearFilters,
  onSortChange,
  activeFiltersCount = 0,
  className = '',
  compact = false
}) => {
  // State for showing advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortOption, setSortOption] = useState('departure');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Default filter values
  const defaultFilters = {
    departureDate: '',
    departureTimeStart: '',
    departureTimeEnd: '',
    maxPrice: '',
    minRating: 0,
    availableSeats: 1,
    allowPets: false,
    allowSmoking: false,
    allowDetours: false
  };
  
  // Merge default with provided filters
  const currentFilters = { ...defaultFilters, ...filters };
  
  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const updatedFilters = {
      ...currentFilters,
      [name]: newValue
    };
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };
  
  // Handle sort changes
  const handleSortChange = (option) => {
    // If clicking the same option, toggle direction
    if (option === sortOption) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      
      if (onSortChange) {
        onSortChange(option, newDirection);
      }
    } else {
      // New option, default to ascending
      setSortOption(option);
      setSortDirection('asc');
      
      if (onSortChange) {
        onSortChange(option, 'asc');
      }
    }
  };
  
  // Generate star rating inputs
  const renderStarRating = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Form.Check
          key={i}
          inline
          type="radio"
          id={`rating-${i}`}
          name="minRating"
          value={i}
          label={`${i}+`}
          checked={parseInt(currentFilters.minRating) === i}
          onChange={handleFilterChange}
        />
      );
    }
    
    return stars;
  };
  
  return (
    <Card className={`ride-filter ${className}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <h5 className="mb-0">Filters</h5>
          {activeFiltersCount > 0 && (
            <Badge pill bg="primary" className="ms-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div>
          {activeFiltersCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0 me-3"
              onClick={handleClearFilters}
            >
              <FaTrash className="me-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="link"
            className="p-0 text-dark"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        <Form>
          {/* Basic Filters */}
          <Row className="gx-3">
            {/* Date Filter */}
            <Col md={compact ? 6 : 3} className="mb-3">
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaCalendarAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    name="departureDate"
                    value={currentFilters.departureDate}
                    onChange={handleFilterChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            {/* Price Filter */}
            <Col md={compact ? 6 : 3} className="mb-3">
              <Form.Group>
                <Form.Label>Max Price</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaMoneyBillWave />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="maxPrice"
                    placeholder="Any price"
                    value={currentFilters.maxPrice}
                    onChange={handleFilterChange}
                    min="0"
                    step="1"
                  />
                  <InputGroup.Text>$</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            
            {/* Seats Filter */}
            <Col md={compact ? 6 : 3} className="mb-3">
              <Form.Group>
                <Form.Label>Seats Needed</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUserFriends />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="availableSeats"
                    value={currentFilters.availableSeats}
                    onChange={handleFilterChange}
                    min="1"
                    max="8"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            {/* Sort Filter */}
            <Col md={compact ? 6 : 3} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Sort By
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2"
                    onClick={() => handleSortChange(sortOption)}
                  >
                    {sortDirection === 'asc' ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
                  </Button>
                </Form.Label>
                <Form.Select 
                  value={sortOption} 
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="departure">Departure Time</option>
                  <option value="price">Price</option>
                  <option value="duration">Trip Duration</option>
                  <option value="driverRating">Driver Rating</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Advanced Filters */}
          <Collapse in={showAdvanced}>
            <div>
              <hr />
              <h6 className="mb-3">Advanced Filters</h6>
              
              <Row className="gx-3">
                {/* Time Range */}
                <Col md={6} lg={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Departure Time Range</Form.Label>
                    <Row>
                      <Col xs={6}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaClock />
                          </InputGroup.Text>
                          <Form.Control
                            type="time"
                            name="departureTimeStart"
                            value={currentFilters.departureTimeStart}
                            onChange={handleFilterChange}
                            placeholder="From"
                          />
                        </InputGroup>
                      </Col>
                      <Col xs={6}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaClock />
                          </InputGroup.Text>
                          <Form.Control
                            type="time"
                            name="departureTimeEnd"
                            value={currentFilters.departureTimeEnd}
                            onChange={handleFilterChange}
                            placeholder="To"
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                
                {/* Minimum Rating */}
                <Col md={6} lg={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Minimum Driver Rating</Form.Label>
                    <div className="d-flex align-items-center mb-2">
                      <FaStar className="text-warning me-2" />
                      <div>
                        {renderStarRating()}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                
                {/* Ride Preferences */}
                <Col md={12} lg={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Ride Preferences</Form.Label>
                    <div className="d-flex flex-column">
                      <Form.Check
                        type="checkbox"
                        id="allow-pets"
                        label="Pet-friendly rides"
                        name="allowPets"
                        checked={currentFilters.allowPets}
                        onChange={handleFilterChange}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="allow-smoking"
                        label="Smoking allowed"
                        name="allowSmoking"
                        checked={currentFilters.allowSmoking}
                        onChange={handleFilterChange}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="allow-detours"
                        label="Detours allowed"
                        name="allowDetours"
                        checked={currentFilters.allowDetours}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    // Apply advanced filters explicitly if needed
                    if (onFilterChange) {
                      onFilterChange(currentFilters);
                    }
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Collapse>
          
          {/* Main Filter Actions */}
          <div className="filter-actions mt-3 d-md-flex justify-content-between align-items-center">
            {compact && (
              <div className="d-grid mb-3 mb-md-0">
                <Button variant="primary" onClick={() => onFilterChange && onFilterChange(currentFilters)}>
                  <FaFilter className="me-2" />
                  Apply Filters
                </Button>
              </div>
            )}
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="link" 
                className="text-decoration-none p-0" 
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                {showAdvanced ? <FaAngleUp className="ms-1" /> : <FaAngleDown className="ms-1" />}
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="link"
                  className="text-danger p-0 ms-3"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

RideFilter.propTypes = {
  filters: PropTypes.shape({
    departureDate: PropTypes.string,
    departureTimeStart: PropTypes.string,
    departureTimeEnd: PropTypes.string,
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    availableSeats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    allowPets: PropTypes.bool,
    allowSmoking: PropTypes.bool,
    allowDetours: PropTypes.bool
  }),
  onFilterChange: PropTypes.func,
  onClearFilters: PropTypes.func,
  onSortChange: PropTypes.func,
  activeFiltersCount: PropTypes.number,
  className: PropTypes.string,
  compact: PropTypes.bool
};

export default RideFilter;