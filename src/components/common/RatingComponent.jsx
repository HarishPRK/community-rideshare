import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { Form } from 'react-bootstrap';

/**
 * RatingComponent - A reusable component for displaying and submitting ratings
 * 
 * Can be used for:
 * - Showing user ratings in profiles
 * - Displaying ride ratings in history
 * - Submitting new ratings for completed rides
 */
const RatingComponent = ({
  value = 0,
  count = 0,
  size = 'md',
  color = '#FFC107', // Bootstrap warning color
  precision = 0.5,
  editable = false,
  onChange = null,
  showCount = true,
  label = null,
  showValue = true,
  withFeedback = false,
  feedbackValue = '',
  onFeedbackChange = null,
  feedbackPlaceholder = 'Additional comments (optional)'
}) => {
  // State for hover effect
  const [hoverRating, setHoverRating] = useState(0);

  // Calculate the star sizes based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'xs':
        return 12;
      case 'sm':
        return 16;
      case 'md':
        return 24;
      case 'lg':
        return 32;
      case 'xl':
        return 40;
      default:
        return typeof size === 'number' ? size : 24;
    }
  };

  const starSize = getStarSize();

  // Generate the star elements
  const generateStars = () => {
    const stars = [];
    const activeRating = hoverRating > 0 ? hoverRating : value;
    
    // Create array of 5 stars
    for (let i = 1; i <= 5; i++) {
      // Calculate star type: full, half or empty
      const difference = activeRating - i + 1;
      let starIcon;
      
      if (difference >= 0) {
        starIcon = <FaStar size={starSize} style={{ color }} />;
      } else if (difference > -1 && difference < 0 && precision === 0.5) {
        starIcon = <FaStarHalfAlt size={starSize} style={{ color }} />;
      } else {
        starIcon = <FaRegStar size={starSize} style={{ color }} />;
      }
      
      // Add event handlers if editable
      const starProps = editable ? {
        onClick: () => handleRatingChange(i),
        onMouseEnter: () => setHoverRating(i),
        onMouseLeave: () => setHoverRating(0),
        style: { cursor: 'pointer' }
      } : {};
      
      stars.push(
        <span key={i} {...starProps} className="d-inline-block">
          {starIcon}
        </span>
      );
    }
    
    return stars;
  };
  
  // Handle rating changes
  const handleRatingChange = (newRating) => {
    if (editable && onChange) {
      onChange(newRating);
    }
  };

  // Handle feedback changes
  const handleFeedbackChange = (e) => {
    if (onFeedbackChange) {
      onFeedbackChange(e.target.value);
    }
  };

  // Get text description based on rating value
  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    if (rating >= 0.5) return 'Very Poor';
    return 'Not Rated';
  };

  return (
    <div className="rating-component">
      {label && <div className="mb-2">{label}</div>}
      
      <div className="d-flex align-items-center mb-1">
        <div className="stars-container me-2">
          {generateStars()}
        </div>
        
        {showValue && (
          <div className="rating-value">
            <span className="fw-semibold">{value.toFixed(1)}</span>
            
            {showCount && (
              <span className="text-muted ms-1">
                ({count} {count === 1 ? 'rating' : 'ratings'})
              </span>
            )}
            
            {value > 0 && (
              <span className="rating-text ms-2 small">
                {getRatingText(value)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {withFeedback && (
        <Form.Group className="mt-3">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={feedbackPlaceholder}
            value={feedbackValue}
            onChange={handleFeedbackChange}
          />
        </Form.Group>
      )}
    </div>
  );
};

RatingComponent.propTypes = {
  value: PropTypes.number,
  count: PropTypes.number,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    PropTypes.number
  ]),
  color: PropTypes.string,
  precision: PropTypes.oneOf([0.5, 1]),
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  showCount: PropTypes.bool,
  label: PropTypes.node,
  showValue: PropTypes.bool,
  withFeedback: PropTypes.bool,
  feedbackValue: PropTypes.string,
  onFeedbackChange: PropTypes.func,
  feedbackPlaceholder: PropTypes.string
};

export default RatingComponent;