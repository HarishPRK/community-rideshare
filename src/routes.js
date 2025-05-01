import React from 'react';
import { Navigate } from 'react-router-dom';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RequestRidePage from './pages/RequestRidePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailsPage from './pages/RideDetailsPage';
import RideHistoryPage from './pages/RideHistoryPage';
import SearchRidesPage from './pages/SearchRidesPage';
<<<<<<< HEAD
=======
import AuthDebugPage from './pages/AuthDebugPage';
import ApiDebugPage from './pages/ApiDebugPage';
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
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
  {
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
<<<<<<< HEAD
=======
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
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
    path: '*',
    element: <NotFoundPage />,
  },
];

// Higher-order component for protected routes
export const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
  const isAuthenticated = localStorage.getItem('token') ? true : false;
  return isAuthenticated ? children : <Navigate to={redirectPath} replace />;
};

<<<<<<< HEAD
export default routes;
=======
export default routes;
>>>>>>> 9581ae24c5755c57cb6defb071dadb47e37fa080
