import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import GoogleMapsSingleton from './utils/googleMapsSingleton';
import { getGoogleMapsApiKey } from './utils/mapUtils';
import GoogleMapsErrorHandler from './components/common/GoogleMapsErrorHandler';

// Layout components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RequestRidePage from './pages/RequestRidePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailsPage from './pages/RideDetailsPage';
import RideHistoryPage from './pages/RideHistoryPage';
import MyOfferedRidesPage from './pages/MyOfferedRidesPage';
import SearchRidesPage from './pages/SearchRidesPage';
import AuthDebugPage from './pages/AuthDebugPage';
import MapDebugPage from './pages/MapDebugPage';
import NotFoundPage from './pages/NotFoundPage';

// Test components
import MapTest from './components/test/MapTest';
import ApiTest from './components/test/ApiTest';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { RideProvider } from './contexts/RideContext';
import { AuthContext } from './contexts/AuthContext';

// Global styles
import './assets/styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Google Maps API and check authentication
  useEffect(() => {
    // Check if token exists in localStorage and set in axios headers
    const token = localStorage.getItem('token');
    if (token && !axios.defaults.headers.common['Authorization']) {
      console.log('App: Setting Authorization header from localStorage');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Preload Google Maps API with our singleton implementation
    const preloadMaps = async () => {
      try {
        console.log('App: Initializing Google Maps API Singleton');
        
        // Get API key from environment
        const { apiKey, isValid } = getGoogleMapsApiKey();
        
        if (!isValid) {
          console.error('Google Maps API key is missing or invalid');
          return;
        }
        
        // Initialize the singleton with API key
        GoogleMapsSingleton.init(apiKey);
        
        // Start loading the API in the background
        GoogleMapsSingleton.load()
          .then(() => {
            console.log('App: Google Maps API loaded successfully via singleton');
          })
          .catch((error) => {
            console.error('App: Failed to load Google Maps:', error);
          });
      } catch (error) {
        console.error('App: Error initializing Google Maps:', error);
      }
    };
    
    // Start loading after a short delay to prioritize UI rendering
    const timer = setTimeout(() => {
      preloadMaps();
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <RideProvider>
        {/* Removed Router component as it's already in index.js */}
        <div className="app-container d-flex flex-column min-vh-100">
          {/* Global error handler for Google Maps issues */}
          <GoogleMapsErrorHandler />
          <Header />
          {/* Add inline style to remove top padding specifically for the main content area */}
          <main className="flex-grow-1" style={{ paddingTop: 0 }}> 
            <Container className={window.location.pathname !== '/' ? 'py-4' : ''}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<SearchRidesPage />} />
                
                {/* Protected routes - will redirect to login if not authenticated */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request-ride" 
                  element={
                    <ProtectedRoute>
                      <RequestRidePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/offer-ride" 
                  element={
                    <ProtectedRoute>
                      <OfferRidePage />
                    </ProtectedRoute>
                  } 
                />
                {/* Re-implemented as protected route (was temporarily public for testing) */}
                <Route 
                  path="/rides/:rideId" 
                  element={
                    <ProtectedRoute>
                      <RideDetailsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ride-history" 
                  element={
                    <ProtectedRoute>
                      <RideHistoryPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-offered-rides" 
                  element={
                    <ProtectedRoute>
                      <MyOfferedRidesPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Test routes */}
                <Route path="/map-test" element={<MapTest />} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/debug" element={<AuthDebugPage />} />
                <Route path="/map-debug" element={<MapDebugPage />} />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Container>
          </main>
          <Footer />
        </div>
      </RideProvider>
    </AuthProvider>
  );
}

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default App;
