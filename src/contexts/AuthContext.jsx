import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
<<<<<<< HEAD
=======
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080

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
<<<<<<< HEAD
              setCurrentUser(response.data);
=======
              // Correctly set currentUser to the nested user object
              if (response.data && response.data.user) {
                 setCurrentUser(response.data.user); 
              } else {
                 console.error("Initial profile fetch failed: Invalid data structure", response.data);
                 handleLogout(); // Log out if profile data is invalid
              }
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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

<<<<<<< HEAD
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't log out user if profile fetch fails, as they're still authenticated
=======
  // Fetch user profile data and return it
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      // The backend sends { success: true, user: {...} }
      const userData = response.data.user; 
      if (userData) {
        setCurrentUser(userData); // Update context state
        return userData; // Return the fetched user data
      } else {
         console.error('Error fetching user profile: Invalid data structure received', response.data);
         return null; // Return null if data structure is wrong
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't log out user if profile fetch fails, as they're still authenticated
      return null; // Return null on error
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
<<<<<<< HEAD
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      setCurrentUser(response.data);
      return { success: true };
=======
      // The backend sends { success: true, message: '...', user: {...} }
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      // We don't necessarily need to set currentUser here immediately, 
      // as refreshUserProfile will be called right after in ProfilePage
      // setCurrentUser(response.data.user); 
      return { success: true, user: response.data.user }; // Return success and user data
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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

<<<<<<< HEAD
=======
  // Google Authentication
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract user info and token
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Send Google ID token to your backend for verification and JWT creation
      try {
        // For development/demo: If backend is not set up yet, create a mock response
        // In a real app, you would verify the token on your backend
        let response;
        
        try {
          // First try to call the actual backend endpoint
          response = await axios.post(`${API_URL}/auth/google`, { 
            token: idToken,
            userData: {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL
            }
          });
        } catch (backendError) {
          // For demonstration - mock a successful response if backend endpoint doesn't exist
          console.warn('Backend Google auth endpoint not available, using mock response');
          
          // This is just for demonstration purposes when backend is not ready
          response = {
            data: {
              token: idToken, // In a real app, your backend would create a JWT token
              user: {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                profilePicture: user.photoURL
              }
            }
          };
        }
        
        if (response.data && response.data.token) {
          handleLoginSuccess(response.data.token);
          return { success: true };
        }
        
        return { success: false, message: 'Google login failed. Invalid response from server.' };
      } catch (backendError) {
        throw new Error('Failed to verify Google token with the backend');
      }
    } catch (err) {
      const errorMessage = err.message || 'Google login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
  // Context value
  const authContextValue = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
<<<<<<< HEAD
=======
    loginWithGoogle,
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
