import React from 'react';
import { Navigate } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RequestRidePage from './pages/RequestRidePage'; // Restored import
import OfferRidePage from './pages/OfferRidePage';
import RideDetailsPage from './pages/RideDetailsPage';
import RideHistoryPage from './pages/RideHistoryPage';
import SearchRidesPage from './pages/SearchRidesPage';
import AuthDebugPage from './pages/AuthDebugPage';
import ApiDebugPage from './pages/ApiDebugPage';
import NotFoundPage from './pages/NotFoundPage';

// Route definitions
const routes = [
  {
    path: '/',
    element: <HomePage />,
    exact: true,
  },
  {
    path: '/login',
    element: <LoginPage />,
    exact: true,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    exact: true,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true,
  },
  { // Restored Request Ride route
    path: '/request-ride',
    element: <RequestRidePage />,
    protected: true,
  },
  {
    path: '/offer-ride',
    element: <OfferRidePage />,
    protected: true,
  },
  {
    path: '/rides/:rideId',
    element: <RideDetailsPage />,
    protected: true,
  },
  {
    path: '/ride-history',
    element: <RideHistoryPage />,
    protected: true,
  },
  {
    path: '/search',
    element: <SearchRidesPage />,
  },
  {
    path: '/auth-debug',
    element: <AuthDebugPage />,
    // Not protected, so we can debug auth issues even when not logged in
  },
  {
    path: '/api-debug',
    element: <ApiDebugPage />,
    // Not protected, so we can debug API issues even when not logged in
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Higher-order component for protected routes
export const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
  const isAuthenticated = localStorage.getItem('token') ? true : false;
  return isAuthenticated ? children : <Navigate to={redirectPath} replace />;
};

export default routes;
