# Google Maps Integration Debugging Guide

## Troubleshooting Steps for Maps Not Displaying

If the maps are not displaying in your Community RideShare application, follow these steps to identify and resolve the issue:

## 1. Check API Key Configuration

Your Google Maps API key is currently set in the `.env` file:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyC32Apf0L_mSCk84KDk73KjrOhdqrkd9rs
```

Verify the following:
- The API key is correctly set in your `.env` file
- The API key has the necessary permissions (Maps JavaScript API, Places API, Directions API)
- The API key is not restricted to specific domains that don't include your development environment
- There are no billing issues with your Google Cloud account

## 2. Check Browser Console for Errors

Common error messages include:
- `Google Maps JavaScript API error: InvalidKeyMapError` - API key issues
- `Google Maps JavaScript API error: MissingKeyMapError` - Missing API key
- `Google Maps JavaScript API error: RefererNotAllowedMapError` - Domain restrictions
- `Google Maps JavaScript API error: QuotaExceededMapError` - Quota/billing issues
- `TypeError: Cannot read property 'maps' of undefined` - Script loading issues

## 3. Check Network Requests

In the browser's Network tab, look for requests to `maps.googleapis.com`. If these are returning 403 Forbidden errors, it's likely an API key issue.

## 4. Try the Map Test Component

Use our dedicated Map Test component to isolate the issue:
1. Open http://localhost:3000/map-test in your browser
2. This page loads only the map component without other dependencies
3. Check if the map displays correctly here

## 5. Force API Key Reload

Sometimes the API key needs to be explicitly refreshed:

```javascript
import { resetGoogleMapsApiLoadAttempt } from '../utils/googleMapsLoader';

// Call this before trying to load maps again
resetGoogleMapsApiLoadAttempt();
```

## 6. Clear Browser Cache

Maps API resources might be cached incorrectly:
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## 7. Verify Dependencies

Make sure you have the required dependencies installed:
- `@react-google-maps/api`
- `@googlemaps/js-api-loader`

## 8. Check for Script Blockers

Browser extensions like AdBlock, Privacy Badger, or NoScript might block Google Maps scripts. Try:
1. Disabling extensions
2. Testing in an incognito window

## Common Solutions

1. **If API key is correctly set but maps don't load**:
   - Restart your development server
   - Check for domain restrictions in Google Cloud Console
   - Test with a new API key without restrictions

2. **If maps load but show "For development purposes only"**:
   - Set up billing in Google Cloud Console
   - Check quota limits

3. **If maps load but show grey boxes/tiles**:
   - Check if your API key has Maps JavaScript API enabled
   - Verify billing is enabled

4. **If you get CORS errors**:
   - Ensure your domain is whitelisted in the API key settings

Remember: Always restart your development server after making changes to environment variables.
