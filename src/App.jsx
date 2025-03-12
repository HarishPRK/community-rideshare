import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

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
import SearchRidesPage from './pages/SearchRidesPage';
import NotFoundPage from './pages/NotFoundPage';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { RideProvider } from './contexts/RideContext';
import { AuthContext } from './contexts/AuthContext';

// Global styles
import './assets/styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial app loading/authentication check
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
          <Header />
          <main className="flex-grow-1 py-4">
            <Container>
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