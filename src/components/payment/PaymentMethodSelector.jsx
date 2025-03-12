import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Form, 
  Card, 
  Button, 
  Modal, 
  Row, 
  Col, 
  InputGroup, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaPlusCircle, 
  FaTrash, 
  FaCheck, 
  FaPaypal, 
  FaLock,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover
} from 'react-icons/fa';

/**
 * PaymentMethodSelector - A component for selecting and managing payment methods
 * 
 * Features:
 * - Select from saved payment methods
 * - Add new payment methods
 * - Remove existing payment methods
 * - Set default payment method
 */
const PaymentMethodSelector = ({
  savedMethods = [],
  defaultMethod = null,
  onChange,
  onAddMethod,
  onRemoveMethod,
  onSetDefault,
  loading = false,
  error = null,
  className = ''
}) => {
  // State for modal and form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'card',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(defaultMethod || (savedMethods.length > 0 ? savedMethods[0].id : 'cash'));
  
  // Handle payment method selection
  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    
    if (onChange) {
      onChange(methodId);
    }
  };
  
  // Handle opening add method modal
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setFormErrors({});
    setNewMethod({
      type: 'card',
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: true
    });
  };
  
  // Handle closing add method modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNewMethod({
      ...newMethod,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation errors as user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Detect card type from number
  const detectCardType = (cardNumber) => {
    const visaRegex = /^4/;
    const mastercardRegex = /^5[1-5]/;
    const amexRegex = /^3[47]/;
    const discoverRegex = /^6(?:011|5)/;
    
    if (visaRegex.test(cardNumber)) return 'visa';
    if (mastercardRegex.test(cardNumber)) return 'mastercard';
    if (amexRegex.test(cardNumber)) return 'amex';
    if (discoverRegex.test(cardNumber)) return 'discover';
    
    return null;
  };
  
  // Get card icon based on card type
  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'visa':
        return <FaCcVisa className="text-primary" size={24} />;
      case 'mastercard':
        return <FaCcMastercard className="text-danger" size={24} />;
      case 'amex':
        return <FaCcAmex className="text-info" size={24} />;
      case 'discover':
        return <FaCcDiscover className="text-warning" size={24} />;
      default:
        return <FaCreditCard size={24} />;
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (newMethod.type === 'card') {
      // Validate card number (remove spaces)
      const cardNumber = newMethod.cardNumber.replace(/\s/g, '');
      if (!cardNumber) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{13,19}$/.test(cardNumber)) {
        errors.cardNumber = 'Card number must be between 13 and 19 digits';
      }
      
      // Validate card name
      if (!newMethod.cardName.trim()) {
        errors.cardName = 'Cardholder name is required';
      }
      
      // Validate expiry month
      if (!newMethod.expiryMonth) {
        errors.expiryMonth = 'Required';
      }
      
      // Validate expiry year
      if (!newMethod.expiryYear) {
        errors.expiryYear = 'Required';
      }
      
      // Validate CVV
      const cvvRegex = newMethod.cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/;
      if (!newMethod.cvv) {
        errors.cvv = 'Required';
      } else if (!cvvRegex.test(newMethod.cvv)) {
        errors.cvv = newMethod.cardType === 'amex' ? 'Must be 4 digits' : 'Must be 3 digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onAddMethod) {
        onAddMethod(newMethod);
      }
      
      handleCloseAddModal();
    }
  };
  
  // Handle card number formatting
  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const cardNumber = value.replace(/\D/g, '');
    // Limit to 19 digits
    const truncated = cardNumber.substring(0, 19);
    // Add spaces every 4 digits
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };
  
  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    const cardType = detectCardType(formatted.replace(/\s/g, ''));
    
    setNewMethod({
      ...newMethod,
      cardNumber: formatted,
      cardType
    });
    
    // Clear validation error as user types
    if (formErrors.cardNumber) {
      setFormErrors({
        ...formErrors,
        cardNumber: null
      });
    }
  };
  
  // Mask card number for display
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    
    // Remove spaces
    const cleanNumber = cardNumber.replace(/\s/g, '');
    // Keep first 4 and last 4 digits visible
    return cleanNumber.substring(0, 4) + ' •••• •••• ' + cleanNumber.slice(-4);
  };
  
  // Handle remove payment method
  const handleRemoveMethod = (methodId, e) => {
    e.stopPropagation();
    
    if (onRemoveMethod) {
      onRemoveMethod(methodId);
    }
    
    // If the removed method was selected, select the first available method or cash
    if (methodId === selectedMethod) {
      const availableMethods = savedMethods.filter(method => method.id !== methodId);
      const newSelectedMethod = availableMethods.length > 0 ? availableMethods[0].id : 'cash';
      
      handleMethodSelect(newSelectedMethod);
    }
  };
  
  // Handle set default payment method
  const handleSetDefault = (methodId, e) => {
    e.stopPropagation();
    
    if (onSetDefault) {
      onSetDefault(methodId);
    }
  };
  
  return (
    <div className={className}>
      <Form>
        <div className="mb-3">
          {/* Error display */}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          {/* Cash option */}
          <Card 
            className={`mb-2 cursor-pointer ${selectedMethod === 'cash' ? 'border-primary' : ''}`}
            onClick={() => handleMethodSelect('cash')}
          >
            <Card.Body className="d-flex align-items-center">
              <div className={`me-3 ${selectedMethod === 'cash' ? 'text-primary' : 'text-muted'}`}>
                <FaMoneyBillWave size={24} />
              </div>
              <div className="flex-grow-1">
                <Form.Check
                  type="radio"
                  id="payment-cash"
                  label="Cash"
                  checked={selectedMethod === 'cash'}
                  onChange={() => handleMethodSelect('cash')}
                  className="fw-semibold"
                />
                <div className="text-muted small">Pay with cash to driver</div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Saved payment methods */}
          {savedMethods.map(method => (
            <Card 
              key={method.id}
              className={`mb-2 cursor-pointer ${selectedMethod === method.id ? 'border-primary' : ''}`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <Card.Body className="d-flex align-items-center">
                <div className={`me-3 ${selectedMethod === method.id ? 'text-primary' : 'text-muted'}`}>
                  {method.type === 'card' ? (
                    getCardIcon(method.cardType)
                  ) : (
                    <FaPaypal size={24} />
                  )}
                </div>
                <div className="flex-grow-1">
                  <Form.Check
                    type="radio"
                    id={`payment-${method.id}`}
                    label={
                      <div className="d-flex align-items-center">
                        <span>{method.type === 'card' ? maskCardNumber(method.cardNumber) : method.email}</span>
                        {method.isDefault && (
                          <span className="badge bg-success ms-2">Default</span>
                        )}
                      </div>
                    }
                    checked={selectedMethod === method.id}
                    onChange={() => handleMethodSelect(method.id)}
                    className="fw-semibold"
                  />
                  {method.type === 'card' && (
                    <div className="text-muted small">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  )}
                </div>
                <div className="d-flex">
                  {!method.isDefault && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={(e) => handleSetDefault(method.id, e)}
                      disabled={loading}
                    >
                      <FaCheck className="me-1" />
                      <span className="d-none d-md-inline">Set Default</span>
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => handleRemoveMethod(method.id, e)}
                    disabled={loading}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
          
          {/* Add new payment method button */}
          <Button
            variant="outline-primary"
            className="w-100 mt-3"
            onClick={handleOpenAddModal}
            disabled={loading}
          >
            <FaPlusCircle className="me-2" />
            Add Payment Method
          </Button>
        </div>
      </Form>
      
      {/* Add Payment Method Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Payment type selection */}
            <Form.Group className="mb-3">
              <Form.Label>Payment Type</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="payment-type-card"
                  name="type"
                  value="card"
                  label="Credit/Debit Card"
                  checked={newMethod.type === 'card'}
                  onChange={handleInputChange}
                  className="me-3"
                />
                <Form.Check
                  inline
                  type="radio"
                  id="payment-type-paypal"
                  name="type"
                  value="paypal"
                  label="PayPal"
                  checked={newMethod.type === 'paypal'}
                  onChange={handleInputChange}
                />
              </div>
            </Form.Group>
            
            {newMethod.type === 'card' ? (
              /* Credit Card Form */
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      {newMethod.cardType ? 
                        getCardIcon(newMethod.cardType) : 
                        <FaCreditCard />
                      }
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={newMethod.cardNumber}
                      onChange={handleCardNumberChange}
                      isInvalid={!!formErrors.cardNumber}
                      autoComplete="cc-number"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.cardNumber}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cardholder Name</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={newMethod.cardName}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.cardName}
                      autoComplete="cc-name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.cardName}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiration Date</Form.Label>
                      <Row>
                        <Col xs={6}>
                          <InputGroup hasValidation>
                            <Form.Select
                              name="expiryMonth"
                              value={newMethod.expiryMonth}
                              onChange={handleInputChange}
                              isInvalid={!!formErrors.expiryMonth}
                              autoComplete="cc-exp-month"
                            >
                              <option value="">Month</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = (i + 1).toString().padStart(2, '0');
                                return (
                                  <option key={month} value={month}>
                                    {month}
                                  </option>
                                );
                              })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {formErrors.expiryMonth}
                            </Form.Control.Feedback>
                          </InputGroup>
                        </Col>
                        <Col xs={6}>
                          <InputGroup hasValidation>
                            <Form.Select
                              name="expiryYear"
                              value={newMethod.expiryYear}
                              onChange={handleInputChange}
                              isInvalid={!!formErrors.expiryYear}
                              autoComplete="cc-exp-year"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = (new Date().getFullYear() + i).toString();
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {formErrors.expiryYear}
                            </Form.Control.Feedback>
                          </InputGroup>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV</Form.Label>
                      <InputGroup hasValidation>
                        <Form.Control
                          type="password"
                          name="cvv"
                          placeholder="123"
                          value={newMethod.cvv}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.cvv}
                          autoComplete="cc-csc"
                          maxLength={newMethod.cardType === 'amex' ? 4 : 3}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.cvv}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="save-card"
                    name="saveCard"
                    label="Save card for future payments"
                    checked={newMethod.saveCard}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <div className="text-muted small d-flex align-items-center mb-3">
                  <FaLock className="me-2" />
                  <span>Your payment information is encrypted and secure.</span>
                </div>
              </>
            ) : (
              /* PayPal Form */
              <div className="text-center p-4">
                <FaPaypal size={48} className="text-primary mb-3" />
                <p>
                  You will be redirected to PayPal to complete the setup.
                </p>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner 
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              'Add Payment Method'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

PaymentMethodSelector.propTypes = {
  savedMethods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['card', 'paypal']).isRequired,
      cardNumber: PropTypes.string,
      cardType: PropTypes.string,
      expiryMonth: PropTypes.string,
      expiryYear: PropTypes.string,
      email: PropTypes.string,
      isDefault: PropTypes.bool
    })
  ),
  defaultMethod: PropTypes.string,
  onChange: PropTypes.func,
  onAddMethod: PropTypes.func,
  onRemoveMethod: PropTypes.func,
  onSetDefault: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string
};

export default PaymentMethodSelector;