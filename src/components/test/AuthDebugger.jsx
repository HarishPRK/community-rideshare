import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebugger = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [decodedToken, setDecodedToken] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [headerValid, setHeaderValid] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || '');

    // Decode token if it exists
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setDecodedToken(decoded);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        setTokenValid(decoded.exp > currentTime);
      } catch (err) {
        setDecodedToken(null);
        setTokenValid(false);
        setError('Token is invalid and cannot be decoded');
      }
    }

    // Check if Authorization header is set in axios
    const authHeader = axios.defaults.headers.common['Authorization'];
    setHeaderValid(!!authHeader);
  }, []);

  const testAuthEndpoint = async () => {
    setLoading(true);
    setError(null);
    setTestResponse(null);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    
    try {
      // Force set the header for this request
      const currentToken = localStorage.getItem('token');
      
      // Log the authorization header for the request
      console.log('Making test request with Authorization header:', `Bearer ${currentToken}`);
      
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      setTestResponse({
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error('Auth test error:', err);
      setError(err.response?.data?.message || err.message || 'Authentication test failed');
      setTestResponse(err.response ? {
        status: err.response.status,
        data: err.response.data
      } : null);
    } finally {
      setLoading(false);
    }
  };
  
  const resetAuth = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setDecodedToken(null);
    setTokenValid(false);
    setHeaderValid(false);
    window.location.reload();
  };
  
  const reinstateAuth = () => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setHeaderValid(true);
      window.location.reload();
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Authentication Debugger</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-4">
          <h6>Authentication Status</h6>
          <ListGroup>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              Current User:
              <Badge bg={currentUser ? 'success' : 'danger'}>
                {currentUser ? currentUser.email : 'Not Logged In'}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              isAuthenticated Flag:
              <Badge bg={isAuthenticated ? 'success' : 'danger'}>
                {isAuthenticated ? 'True' : 'False'}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              Token in localStorage:
              <Badge bg={token ? 'success' : 'danger'}>
                {token ? 'Present' : 'Missing'}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              Token Valid:
              <Badge bg={tokenValid ? 'success' : 'danger'}>
                {tokenValid ? 'Yes' : 'No'}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              Axios Header Set:
              <Badge bg={headerValid ? 'success' : 'danger'}>
                {headerValid ? 'Yes' : 'No'}
              </Badge>
            </ListGroup.Item>
          </ListGroup>
        </div>
        
        {decodedToken && (
          <div className="mb-4">
            <h6>Decoded Token</h6>
            <pre className="bg-light p-3 border rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(decodedToken, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="d-flex gap-2 mb-4">
          <Button 
            variant="outline-primary" 
            onClick={testAuthEndpoint} 
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Authentication'}
          </Button>
          
          <Button
            variant="outline-warning"
            onClick={reinstateAuth}
            disabled={!token || headerValid}
          >
            Reinstate Auth Header
          </Button>
          
          <Button 
            variant="outline-danger" 
            onClick={resetAuth}
          >
            Reset Auth State
          </Button>
        </div>
        
        {testResponse && (
          <div>
            <h6>Test Response (Status: {testResponse.status})</h6>
            <pre className="bg-light p-3 border rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(testResponse.data, null, 2)}
            </pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AuthDebugger;
