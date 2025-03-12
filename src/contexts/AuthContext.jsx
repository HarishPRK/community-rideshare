import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create context
export const AuthContext = createContext();

// API base URL - should match your backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state from localStorage on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Validate token by checking expiration
          try {
            const decodedToken = jwtDecode(storedToken);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp > currentTime) {
              // Token is valid
              setToken(storedToken);
              setIsAuthenticated(true);
              
              // Set up axios headers for all future requests
              axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
              
              // Fetch user profile
              const response = await axios.get(`${API_URL}/users/profile`);
              setCurrentUser(response.data);
            } else {
              // Token expired, clear everything
              handleLogout();
            }
          } catch (err) {
            // Invalid token format
            handleLogout();
          }
        }
      } catch (err) {
        setError('Authentication failed. Please log in again.');
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Auto-login after successful registration
      if (response.data && response.data.token) {
        handleLoginSuccess(response.data.token);
        return { success: true };
      }
      
      return { success: false, message: 'Registration successful but no token returned' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data && response.data.token) {
        handleLoginSuccess(response.data.token);
        return { success: true };
      }
      
      return { success: false, message: 'Login failed. Invalid response from server.' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Handle successful login
  const handleLoginSuccess = (authToken) => {
    // Store token in localStorage
    localStorage.setItem('token', authToken);
    
    // Update state
    setToken(authToken);
    setIsAuthenticated(true);
    
    // Set up axios headers for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Decode token to get user info
    const decodedToken = jwtDecode(authToken);
    
    // Set basic user info from token
    setCurrentUser({
      id: decodedToken.id,
      email: decodedToken.email,
      name: decodedToken.name,
      // Other fields will be loaded from profile endpoint
    });
    
    // Fetch full user profile data
    fetchUserProfile();
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't log out user if profile fetch fails, as they're still authenticated
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      setCurrentUser(response.data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Reset state
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear Authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Context value
  const authContextValue = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout: handleLogout,
    updateProfile,
    refreshUserProfile: fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};