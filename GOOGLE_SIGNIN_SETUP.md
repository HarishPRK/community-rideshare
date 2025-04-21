# Setting Up Google Sign-In for Community Rideshare

This guide will walk you through the process of setting up Google Authentication for the Community Rideshare application.

## Prerequisites

- A Google Cloud Platform account
- Firebase project (can be created from Google Cloud Console)
- Your Community Rideshare app code

## Steps to Configure Google Sign-In

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" 
3. Enter a project name like "Community-Rideshare"
4. Follow the setup wizard (enable Google Analytics if desired)
5. Click "Create Project"

### 2. Configure Authentication

1. In the Firebase Console, navigate to your project
2. Select "Authentication" from the left sidebar
3. Click on the "Sign-in method" tab
4. Click on "Google" in the list of providers
5. Toggle the "Enable" switch to enable Google authentication
6. Enter your support email (typically your own email)
7. Click "Save"

### 3. Register Your Web App

1. In the Firebase Console, click on the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" and click the web icon (</>) 
4. Register your app with a nickname (e.g., "community-rideshare-web")
5. Optionally set up Firebase Hosting if needed
6. Click "Register app"
7. Copy the Firebase configuration object - you'll need this for the next step

### 4. Configure Your Environment Variables

1. In your Community Rideshare project, locate the `.env` file
2. Update the Firebase configuration variables with the values from your Firebase project:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 5. Set Up Authorized Domains

1. In the Firebase Authentication settings, go to the "Sign-in method" tab
2. Scroll down to "Authorized domains"
3. Add your application's domain (e.g., `localhost` for development)

### 6. Backend Integration (If Applicable)

For a complete integration, your backend will need to:

1. Verify the Google ID token
2. Create or update user records in your database
3. Generate a JWT token for your application

A sample endpoint would be:

```
POST /api/auth/google
Body: {
  token: "google-id-token",
  userData: {
    name: "User Name",
    email: "user@example.com",
    photoURL: "https://example.com/photo.jpg"
  }
}
```

## Testing Google Sign-In

1. Start your React application
2. Navigate to the login page
3. Click the Google sign-in button
4. Select a Google account when prompted
5. If set up correctly, you should be authenticated and redirected to the home page

## Troubleshooting

- If you get a "popup closed" error, make sure pop-ups are allowed in your browser
- If authentication fails, check your Firebase configuration values
- Verify your domain is in the authorized domains list in Firebase
- For local development, make sure `localhost` is in the authorized domains
- Check browser console for any error messages related to Firebase

## Next Steps

- Consider implementing additional authentication providers (Facebook, Twitter, etc.)
- Add multi-factor authentication for increased security
- Set up email verification for users signing up with email/password
