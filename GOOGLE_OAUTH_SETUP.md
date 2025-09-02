# Google OAuth Setup Guide

## Prerequisites
You need to set up a Google OAuth application to enable Google Sign-In functionality.

## Step 1: Create Google OAuth Application

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (alternative dev port)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (alternative dev port)

## Step 2: Configure Environment Variables

Update your `.env` file with the Google Client ID:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

**Important**: Replace `your-actual-google-client-id-here` with the actual Client ID from Google Cloud Console.

## Step 3: Test Google Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login or register page
3. Click the "Sign in with Google" button
4. Complete the Google OAuth flow
5. You should be automatically logged in and redirected to the home page

## Features Included

✅ **Backend Integration**
- Google ID token verification
- Automatic user creation for new Google users
- JWT token generation for authenticated sessions

✅ **Frontend Integration**
- Google Sign-In button on login and register pages
- Automatic script loading and initialization
- Error handling and loading states
- Seamless integration with existing auth flow

✅ **Security Features**
- ID token verification on the backend
- Secure JWT token generation
- Proper error handling and validation

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" Error**
   - Ensure the Google Client ID is correctly set in both environment variables
   - Verify the Client ID matches the one from Google Cloud Console

2. **"Unauthorized Origin" Error**
   - Check that your domain is added to authorized origins in Google Cloud Console
   - Ensure you're accessing the app from the correct URL

3. **Google Sign-In Button Not Appearing**
   - Check browser console for JavaScript errors
   - Verify the Google Client ID environment variable is set
   - Ensure the Google Sign-In script is loading correctly

### Testing with Development Setup:

The Google OAuth is already integrated into:
- Login page (`/login`)
- Register page (`/register`)
- AuthContext for state management
- Backend API endpoint (`/api/auth/google`)

Once you configure the Google Client ID, the authentication will work seamlessly!
