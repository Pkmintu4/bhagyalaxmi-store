import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressDetails {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressDetails) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Enter your address",
  initialValue = "",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      console.warn('Google Maps API key not configured');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      initializeAutocomplete();
    };

    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
      }
    );

    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.address_components) {
      toast({
        title: "Invalid Address",
        description: "Please select a valid address from the suggestions.",
        variant: "destructive"
      });
      return;
    }

    const addressDetails = parseGooglePlace(place);
    setInputValue(place.formatted_address || '');
    onAddressSelect(addressDetails);
    setShowSuggestions(false);
  };

  const parseGooglePlace = (place: any): AddressDetails => {
    const components = place.address_components;
    let street = '';
    let city = '';
    let state = '';
    let postalCode = '';
    let country = 'India';

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        street += component.long_name + ' ';
      }
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
      if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      street: street.trim() || place.name || '',
      city,
      state,
      postalCode,
      country,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng(),
      placeId: place.place_id,
      formattedAddress: place.formatted_address
    };
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enter address manually.",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) {
      setIsLoading(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      setIsLoading(false);
      
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const addressDetails = parseGooglePlace(place);
        setInputValue(place.formatted_address);
        onAddressSelect(addressDetails);
        
        toast({
          title: "Location Found",
          description: "Address detected from your current location.",
        });
      } else {
        toast({
          title: "Geocoding Failed",
          description: "Unable to get address from your location.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="px-3"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {!window.google && (
        <p className="text-xs text-muted-foreground mt-1">
          Configure Google Maps API key to enable address autocomplete
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
