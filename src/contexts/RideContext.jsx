import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create context
export const RideContext = createContext();

// API base URL - should match your backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const RideProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [availableRides, setAvailableRides] = useState([]);
  const [userRides, setUserRides] = useState({
    requested: [],
    offered: [],
    upcoming: [],
    completed: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available rides when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableRides();
      fetchUserRides();
    }
  }, [isAuthenticated]);

  // Fetch available rides in the community
  const fetchAvailableRides = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rides/available`);
      setAvailableRides(response.data);
    } catch (err) {
      setError('Failed to fetch available rides. Please try again.');
      console.error('Error fetching available rides:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's rides (both requested and offered)
  const fetchUserRides = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Fetch rides requested by the user
      const requestedResponse = await axios.get(`${API_URL}/rides/requested`);
      
      // Fetch rides offered by the user
      const offeredResponse = await axios.get(`${API_URL}/rides/offered`);
      
      // Sort rides by upcoming and completed
      const upcoming = [...requestedResponse.data, ...offeredResponse.data]
        .filter(ride => ['pending', 'accepted', 'in_progress'].includes(ride.status))
        .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        
      const completed = [...requestedResponse.data, ...offeredResponse.data]
        .filter(ride => ['completed', 'cancelled'].includes(ride.status))
        .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
      
      setUserRides({
        requested: requestedResponse.data,
        offered: offeredResponse.data,
        upcoming,
        completed,
      });
    } catch (err) {
      setError('Failed to fetch your rides. Please try again.');
      console.error('Error fetching user rides:', err);
    } finally {
      setLoading(false);
    }
  };

  // Request a new ride
  const requestRide = async (rideData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/rides/request`, rideData);
      
      // Refresh rides data
      fetchUserRides();
      fetchAvailableRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to request ride. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Offer a new ride
  const offerRide = async (rideData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/rides/offer`, rideData);
      
      // Refresh rides data
      fetchUserRides();
      fetchAvailableRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to offer ride. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get details for a specific ride
  const getRideDetails = async (rideId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/rides/${rideId}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get ride details.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Accept a ride request (for drivers)
  const acceptRideRequest = async (rideId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/accept`);
      
      // Refresh rides data
      fetchUserRides();
      fetchAvailableRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to accept ride.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Start a ride (for drivers)
  const startRide = async (rideId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/start`);
      
      // Refresh rides data
      fetchUserRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to start ride.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Complete a ride (for drivers)
  const completeRide = async (rideId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/complete`);
      
      // Refresh rides data
      fetchUserRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to complete ride.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cancel a ride (both riders and drivers)
  const cancelRide = async (rideId, reason) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/rides/${rideId}/cancel`, { reason });
      
      // Refresh rides data
      fetchUserRides();
      fetchAvailableRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel ride.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Submit a rating for a completed ride
  const submitRating = async (rideId, ratingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/rides/${rideId}/rate`, ratingData);
      
      // Refresh rides data
      fetchUserRides();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit rating.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Search for available rides based on criteria
  const searchRides = async (searchCriteria) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/rides/search`, searchCriteria);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search rides.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const rideContextValue = {
    availableRides,
    userRides,
    loading,
    error,
    requestRide,
    offerRide,
    getRideDetails,
    acceptRideRequest,
    startRide,
    completeRide,
    cancelRide,
    submitRating,
    searchRides,
    refreshRides: () => {
      fetchAvailableRides();
      fetchUserRides();
    }
  };

  return (
    <RideContext.Provider value={rideContextValue}>
      {children}
    </RideContext.Provider>
  );
};

// Custom hook for using ride context
export const useRide = () => {
  const context = useContext(RideContext);
  
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  
  return context;
};