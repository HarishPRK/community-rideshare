# Maps and Authentication Troubleshooting Guide

This document provides guidance for diagnosing and fixing 403 errors when using the maps functionality and offering/requesting rides in the Community RideShare application.

## Common Issues and Solutions

### 1. Maps Not Displaying

If the map is not displaying in the ride request or offer pages:

- **Check your API key**: Make sure your Google Maps API key is correctly set in the `.env` file.
- **Browser console errors**: Look for any errors in your browser's developer console.
- **Google Maps restrictions**: Verify if your Google Maps API key has any restrictions.

### 2. 403 Error When Offering a Ride

If you're getting a 403 error when attempting to offer a ride:

#### a) Authentication Issues

403 errors often indicate authentication problems:

- **Token issues**: Your JWT token might be missing, expired, or invalid.
- **Verify you're logged in**: Ensure you've successfully logged in and have a valid session.
- **Check headers**: The Authorization header might not be properly set on API requests.

#### b) Coordinate Format Mismatch

A common cause of 403 errors is a mismatch between frontend and backend coordinate formats:

- **Frontend format**: Often uses `lat` and `lng` properties.
- **Backend format**: Often expects `latitude` and `longitude` properties.

This format mismatch can cause validation errors on the backend that result in 403 responses.

#### c) CORS Issues

Cross-Origin Resource Sharing (CORS) issues can also cause 403 errors:

- Check for CORS-related errors in browser console.
- Verify the backend allows requests from your frontend origin.

## Debugging Tools

We've created specialized debugging tools to help diagnose these issues:

### Authentication Debugger

Access at `/auth-debug` to:
- Check if you're properly authenticated
- Examine your current JWT token
- Test the authentication by making a profile request
- Reset your authentication state if needed

### API Testing Tool

Access at `/api-debug` to:
- Test API requests with different payload formats
- Check CORS configuration
- Verify that your account has the necessary permissions

## Debugging Process

1. **Check Authentication First**:
   - Go to `/auth-debug` 
   - Verify you have a valid token
   - Test authentication with the "Test Authentication" button
   - If authentication fails, try logging out and logging back in

2. **Test API Formats**:
   - Go to `/api-debug`
   - Use the "Ride Offer" tab
   - Test both coordinate formats to determine which one works
   - If one format works but the other doesn't, update the corresponding code

3. **Check CORS Configuration**:
   - Use the CORS test in the API debugging tool
   - Check if the required headers are being allowed

4. **Try with a Different Account**:
   - Your user account might lack necessary permissions
   - Try creating a new account and testing again

## Solutions to Common Problems

### Fixed in Recent Updates

- **Coordinate Format Mismatch**: The application has been updated to use the correct coordinate format (`latitude`/`longitude`) when sending data to the backend.

### Manual Fixes

If you're still experiencing 403 errors:

1. **Re-authenticate**: Log out and log back in to get a fresh token.
2. **Clear localStorage**: Open browser dev tools, go to Application > Storage > Local Storage and clear it, then log in again.
3. **Check Backend Logs**: If you have access to the backend, check the logs for more detailed error messages.
4. **Server Settings**: Ensure the backend's CORS settings are configured to allow your frontend origin.

## For Developers

If you need to modify the code to fix these issues:

1. **Frontend Coordinate Format**: In `OfferRidePage.jsx` and similar components, ensure location data follows this format:
   ```javascript
   const locationData = {
     address: "123 Main St",
     latitude: 42.123, // NOT 'lat'
     longitude: -71.456 // NOT 'lng'
   };
   ```

2. **Authentication Implementation**: Check `src/contexts/AuthContext.jsx` to ensure tokens are being stored and passed correctly.

3. **API Service Format**: Verify `src/services/apiService.js` is structured properly for your backend needs.

## Need More Help?

If you're still encountering issues after following this guide:

1. Check the application's GitHub issues for similar problems
2. Use the debugging tools to collect specific error information
3. Contact your system administrator with the detailed error information
