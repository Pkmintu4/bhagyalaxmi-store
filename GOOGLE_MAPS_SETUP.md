# Google Maps API Setup Guide

## Prerequisites
You need to set up Google Maps API to enable accurate location features for user addresses.

## Step 1: Create Google Cloud Project & Enable APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for address autocomplete)
   - **Places API** (for place details and search)
   - **Geocoding API** (for converting addresses to coordinates)

## Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Restrict the API key** (recommended for security):
   - Application restrictions: HTTP referrers
   - Add your domains: `localhost:5173`, `localhost:3000`
   - API restrictions: Select the APIs you enabled above

## Step 3: Configure Environment Variables

Update your `.env` file with the Google Maps API key:

```env
GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key-here
VITE_GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key-here
```

**Important**: Replace `your-actual-google-maps-api-key-here` with your actual API key from Google Cloud Console.

## Step 4: Update Database Schema

The address schema has been updated to support Google Maps data:

```prisma
model Address {
  // ... existing fields
  latitude    Float?   // Google Maps coordinates
  longitude   Float?   // Google Maps coordinates
  placeId     String?  // Google Places ID for accuracy
  formattedAddress String? // Full formatted address from Google
  // ... other fields
}
```

Run the database migration:
```bash
npx prisma db push
```

## Features Implemented

✅ **Address Autocomplete**
- Google Places autocomplete with Indian address focus
- Real-time address suggestions as user types
- Automatic parsing of address components

✅ **Current Location Detection**
- GPS-based location detection
- Reverse geocoding to get address from coordinates
- One-click location button

✅ **Accurate Coordinates**
- Latitude/longitude storage for precise delivery
- Google Place ID for address verification
- Formatted address from Google for consistency

✅ **Enhanced Address Form**
- Integration with existing address management
- Manual address entry as fallback
- Address type selection (Home/Work/Other)

## Usage

The new address components are ready to use:

1. **AddressAutocomplete**: Standalone autocomplete component
2. **AddressForm**: Complete address form with Google Maps integration

### Example Usage:

```tsx
import AddressForm from '@/components/AddressForm';

const handleAddressSubmit = async (address) => {
  // Address includes coordinates and Google data
  console.log(address.latitude, address.longitude);
  console.log(address.placeId, address.formattedAddress);
};

<AddressForm onSubmit={handleAddressSubmit} onCancel={() => {}} />
```

## Benefits

- **Accurate Delivery**: Precise coordinates for delivery optimization
- **Better UX**: Fast address entry with autocomplete
- **Data Quality**: Standardized addresses from Google
- **Location Services**: Current location detection
- **Fallback Support**: Manual entry when GPS/API unavailable

## Troubleshooting

### Common Issues:

1. **API Key Not Working**
   - Verify the API key is correct in `.env`
   - Check API restrictions in Google Cloud Console
   - Ensure billing is enabled for your Google Cloud project

2. **Autocomplete Not Appearing**
   - Check browser console for JavaScript errors
   - Verify the Google Maps script is loading
   - Ensure the API key has Maps JavaScript API enabled

3. **Location Detection Fails**
   - User must grant location permission
   - HTTPS required for geolocation in production
   - Fallback to manual address entry

Once configured, users can quickly add accurate addresses with precise coordinates for optimal delivery experience!
