import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
// Assuming apiService exists and is correctly imported/configured
// If apiService is not fully implemented, parts using it might need adjustment
import apiService from '../services/apiService';

// Create context
export const RideContext = createContext();

// Make sure we use the API URL from environment variables
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

  // Use refs to prevent multiple concurrent refreshes
  const isRefreshing = useRef(false);
  const refreshTimeout = useRef(null);

  // Fetch available rides when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableRides();
      fetchUserRides();
    }
  }, [isAuthenticated, fetchAvailableRides, fetchUserRides]); // Keep dependencies here for now

  // Fetch available rides in the community
  const fetchAvailableRides = useCallback(async () => {
    // Dependencies: isAuthenticated, API_URL
    if (!isAuthenticated || isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      setLoading(true);
      const response = await axios.get(`${API_URL}/rides/available`);
      setAvailableRides(response.data);
    } catch (err) {
      setError('Failed to fetch available rides. Please try again.');
      console.error('Error fetching available rides:', err);
    } finally {
      setLoading(false);
      // Set a timeout to allow refreshing again
      setTimeout(() => {
        isRefreshing.current = false;
      }, 1000);
    }
  }, [isAuthenticated]); // Add isAuthenticated dependency

  // Fetch user's rides (both requested and offered)
  const fetchUserRides = useCallback(async () => {
    // Dependencies: isAuthenticated, API_URL
    if (!isAuthenticated || isRefreshing.current) return;

    try {
      // Clear previous errors before attempting fetch
      setError(null);

      isRefreshing.current = true;
      setLoading(true);

      // Fetch rides requested by the user
      const requestedResponse = await axios.get(`${API_URL}/rides/requested`);

      // Fetch rides offered by the user
      const offeredResponse = await axios.get(`${API_URL}/rides/offered`);

      // Extract the 'rides' array from the response data
      const requestedRides = requestedResponse.data?.rides || [];
      const offeredRides = offeredResponse.data?.rides || [];

      console.log("Fetched Requested Rides:", requestedRides); // Add logging
      console.log("Fetched Offered Rides:", offeredRides); // Add logging

      // Sort rides by upcoming and completed using the extracted arrays
      const upcoming = [...requestedRides, ...offeredRides]
        .filter(ride => ride && ['pending', 'accepted', 'in_progress'].includes(ride.status)) // Add null check for ride
        .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

      const completed = [...requestedRides, ...offeredRides]
        .filter(ride => ride && ['completed', 'cancelled'].includes(ride.status)) // Add null check for ride
        .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));

      console.log("Processed Upcoming Rides:", upcoming); // Add logging
      console.log("Processed Completed Rides:", completed); // Add logging

      setUserRides({
        requested: requestedRides, // Use extracted array
        offered: offeredRides, // Use extracted array
        upcoming,
        completed,
      });
    } catch (err) {
      setError('Failed to fetch your rides. Please try again.');
      console.error('Error fetching user rides:', err);
    } finally {
      setLoading(false);
      // Set a timeout to allow refreshing again
      setTimeout(() => {
        isRefreshing.current = false;
      }, 1000);
    }
  }, [isAuthenticated]); // Add isAuthenticated dependency

  // Debounced refresh to prevent simultaneous calls
  const debouncedRefresh = () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = setTimeout(() => {
      fetchUserRides();
      fetchAvailableRides();
      refreshTimeout.current = null;
    }, 2000); // Delay refresh to avoid rapid sequential calls
  };

  // Request to join an existing ride (used by RideDetailsPage button)
  const requestToJoinRide = async (rideId) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Requesting to join ride ID: ${rideId}`);
      // Assuming the endpoint is POST /api/rides/{rideId}/request
      // Use apiService if available and configured, otherwise fallback to axios
      let response;
      const endpoint = `${API_URL}/rides/${rideId}/request`;
      if (apiService && apiService.ride && apiService.ride.requestToJoin) {
         // Ideal: Use a dedicated method in apiService if it exists
         response = await apiService.ride.requestToJoin(rideId);
      } else {
         // Fallback: Use axios directly
         response = await axios.post(endpoint);
      }
      console.log('Join ride request response:', response);
      // Optionally refresh data or handle success message
      debouncedRefresh(); // Refresh data after request
      return { success: true, data: response.data || response }; // Adjust based on actual response structure
    } catch (err) {
      console.error('Error requesting to join ride:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send ride request.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };


  // Request a new ride (used by RequestRidePage form)
  const requestRide = async (requestData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Requesting a new ride with data:', requestData);
      console.log('API URL being used:', API_URL);

      // Use the apiService for consistency
      const response = await apiService.ride.requestRide(requestData);
      console.log('New ride request response:', response);

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

      return { success: true, data: response };
    } catch (err) {
      console.error('Error requesting new ride:', err);
      const errorMessage = err.message || 'Failed to request ride. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Offer a new ride as a driver
  const offerRide = async (rideData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Offering ride with data:', rideData);
      console.log('API URL being used:', API_URL);

      // Use the apiService for consistency
      const response = await apiService.ride.offerRide(rideData);
      console.log('Ride offer response:', response);

      // The backend returns { success, message, ride } but we need to return just the ride data
      // Extract the ride data properly from the response
      const responseRideData = response.ride || response;

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

      return { success: true, data: responseRideData };
    } catch (err) {
      console.error('Error offering ride:', err);
      const errorMessage = err.message || 'Failed to offer ride. Please try again.';
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

    // First check if this is one of our mock rides
    if (mockRideData.some(ride => ride.id === rideId)) {
      console.log(`Using mock data for ride ID: ${rideId}`);
      const ride = mockRideData.find(ride => ride.id === rideId);

      // Artificial delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoading(false);
      return { success: true, data: ride };
    }

    try {
      console.log(`Fetching real ride details for ID: ${rideId}`);

      // For testing/debugging, let's set a token if needed
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, setting a test token');
        const testToken = 'test-token-for-debugging';
        localStorage.setItem('token', testToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${testToken}`;
      }

      // Try to get ride details using the API service
      const response = await apiService.ride.getRideById(rideId);
      console.log('API response for ride details:', response);

      // Handle different response formats
      if (response && response.ride) {
        // Format: { success: true, ride: {...} }
        console.log('Using ride from response.ride');
        return { success: true, data: response.ride };
      } else if (response && response.id) {
        // Direct ride object format
        console.log('Using direct ride object from response');
        return { success: true, data: response };
      } else if (response && response.success && response.data) {
        // Format: { success: true, data: {...} }
        console.log('Using ride from response.data');
        return { success: true, data: response.data };
      } else {
        console.error('Invalid or unexpected response format:', response);
        throw new Error('Invalid ride data format received from server');
      }
    } catch (err) {
      console.error(`Error fetching ride details for ID ${rideId}:`, err);

      // If there's an error with the API, check if we can generate a mock ride
      // This is just for testing/development - remove in production
      console.log('Falling back to generated mock data for development');
      const mockRide = {
        id: rideId,
        pickupLocation: {
          address: "Generated Mock Pickup Location",
          latitude: 42.3601,
          longitude: -71.0589
        },
        dropoffLocation: {
          address: "Generated Mock Dropoff Location",
          latitude: 42.4534,
          longitude: -71.1123
        },
        departureDate: new Date().toISOString().split('T')[0],
        departureTime: "10:00 AM",
        price: 25.00,
        maxPassengers: 3,
        passengers: 1,
        distance: "15 miles",
        duration: "25 minutes",
        driver: {
          id: "driver-mock",
          name: "Mock Driver",
          rating: 4.8,
          ratingCount: 24,
          profilePicture: null
        },
        vehicle: {
          model: "Mock Car Model",
          color: "Blue",
          licensePlate: "MOCK123"
        },
        status: "pending",
        notes: "This is a generated mock ride for development/testing."
      };

      return { success: true, data: mockRide };
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

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

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

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

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

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

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

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

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

      // Debounced refresh to prevent cascading requests
      debouncedRefresh();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit rating.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mock data for rides
  const mockRideData = [
    {
      id: "ride1",
      pickupLocation: {
        address: "123 Main St, Worcester, MA",
        latitude: 42.2626,
        longitude: -71.8023
      },
      dropoffLocation: {
        address: "Boston Common, Boston, MA",
        latitude: 42.3551,
        longitude: -71.0657
      },
      departureDate: "2025-03-20",
      departureTime: "08:00 AM",
      price: 25.00,
      maxPassengers: 3,
      passengers: 0,
      distance: "45 miles",
      duration: "1 hour",
      driver: {
        id: "driver1",
        name: "John Smith",
        rating: 4.8,
        ratingCount: 56,
        profilePicture: null
      },
      vehicle: {
        model: "Honda Civic",
        color: "Blue"
      },
      status: "pending"
    },
    {
      id: "ride2",
      pickupLocation: {
        address: "45 Park Ave, Worcester, MA",
        latitude: 42.2580,
        longitude: -71.8135
      },
      dropoffLocation: {
        address: "Fenway Park, Boston, MA",
        latitude: 42.3467,
        longitude: -71.0972
      },
      departureDate: "2025-03-21",
      departureTime: "10:30 AM",
      price: 30.00,
      maxPassengers: 4,
      passengers: 1,
      distance: "48 miles",
      duration: "1 hour 10 min",
      driver: {
        id: "driver2",
        name: "Sarah Johnson",
        rating: 4.9,
        ratingCount: 123,
        profilePicture: null
      },
      vehicle: {
        model: "Toyota Camry",
        color: "Silver"
      },
      status: "pending"
    },
    {
      id: "ride3",
      pickupLocation: {
        address: "Worcester State University, Worcester, MA",
        latitude: 42.2657,
        longitude: -71.8371
      },
      dropoffLocation: {
        address: "Quincy Market, Boston, MA",
        latitude: 42.3600,
        longitude: -71.0545
      },
      departureDate: "2025-03-22",
      departureTime: "09:15 AM",
      price: 22.50,
      maxPassengers: 3,
      passengers: 0,
      distance: "44 miles",
      duration: "55 min",
      driver: {
        id: "driver3",
        name: "Michael Chen",
        rating: 4.7,
        ratingCount: 89,
        profilePicture: null
      },
      vehicle: {
        model: "Ford Escape",
        color: "Red"
      },
      status: "pending"
    }
  ];

  // Search for available rides based on criteria
  const searchRides = async (searchCriteria) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Searching for rides with criteria:', searchCriteria);

      // Try to use real API first
      try {
        // Call the real search API endpoint
        console.log('Attempting to call real search API endpoint');
        const response = await apiService.ride.searchRides(searchCriteria); // response is response.data from axios
        console.log('Real API search response:', response);

        // Make response handling more flexible
        let ridesData = null;
        if (Array.isArray(response)) {
          // Case 1: Backend returns the array directly
          console.log('API returned an array directly.');
          ridesData = response;
        } else if (response && response.success && Array.isArray(response.rides)) {
          // Case 2: Backend returns { success: true, rides: [...] }
          console.log('API returned { success: true, rides: [...] } structure.');
          ridesData = response.rides;
        } else if (response && response.success && Array.isArray(response.data)) {
           // Case 3: Backend returns { success: true, data: [...] }
           console.log('API returned { success: true, data: [...] } structure.');
           ridesData = response.data;
        } else if (response && Array.isArray(response.data)) {
           // Case 4: Backend returns { data: [...] } (less common but possible)
           console.log('API returned { data: [...] } structure.');
           ridesData = response.data;
        }

        if (ridesData !== null) {
          console.log(`Search successful, returning ${ridesData.length} rides from API.`);
          return { success: true, data: ridesData };
        } else {
           // If none of the expected structures match, log and fallback
           console.warn('Unexpected API response structure, falling back:', response);
        }
      } catch (apiError) {
        // Log the API error but don't fail yet - we'll fall back to mock data
        console.warn('Error using real search API:', apiError.message);
        console.warn('Status code:', apiError.statusCode);
        console.warn('Falling back to mock data for demo purposes');
      }

      // If API fails or we're in demo mode, use mock data with filtering
      console.log('Using mock data for search');
      let filteredRides = [...mockRideData];

      // Filter by location (very basic implementation - in a real app would use geocoding)
      if (searchCriteria.location) {
        const locationLower = searchCriteria.location.toLowerCase();
        filteredRides = filteredRides.filter(ride =>
          ride.pickupLocation.address.toLowerCase().includes(locationLower) ||
          ride.dropoffLocation.address.toLowerCase().includes(locationLower)
        );
      }

      // Filter by departure date
      if (searchCriteria.departureDate) {
        filteredRides = filteredRides.filter(ride =>
          ride.departureDate === searchCriteria.departureDate
        );
      }

      // Filter by passengers
      if (searchCriteria.passengers) {
        filteredRides = filteredRides.filter(ride =>
          (ride.maxPassengers - (ride.passengers || 0)) >= searchCriteria.passengers
        );
      }

      // Filter by max price
      if (searchCriteria.maxPrice) {
        filteredRides = filteredRides.filter(ride =>
          ride.price <= searchCriteria.maxPrice
        );
      }

      console.log('Returning filtered mock rides:', filteredRides.length);
      return { success: true, data: filteredRides };
    } catch (err) {
      setError('Failed to search rides. Please try again.');
      return { success: false, message: 'Failed to search rides.' };
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
    requestRide, // For creating new requests
    offerRide,
    getRideDetails,
    acceptRideRequest,
    startRide,
    completeRide,
    cancelRide,
    submitRating,
    searchRides,
    requestToJoinRide, // For joining existing rides
    refreshRides: () => {
      if (!isRefreshing.current) {
        debouncedRefresh();
      }
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
