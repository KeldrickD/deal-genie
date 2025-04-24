import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Type definitions for Google Maps API
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: AutocompleteOptions
          ) => Autocomplete;
        };
      };
    };
  }
}

// Load the Google Maps API script
const loadGoogleMapsScript = () => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!API_KEY) {
    console.error('Google Maps API key is missing');
    return;
  }

  // Don't load the script if it's already loaded
  if (window.google && window.google.maps) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

// Define our own types since we don't want to install the entire @types/google.maps package
interface PlaceResult {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
}

interface AutocompleteOptions {
  types?: string[];
  componentRestrictions?: {
    country: string | string[];
  };
}

interface Autocomplete {
  addListener(event: string, callback: () => void): void;
  getPlace(): PlaceResult;
}

interface AddressSearchProps {
  onSearch: (address: string, placeData?: PlaceResult) => void;
  isLoading?: boolean;
}

export default function AddressSearch({ onSearch, isLoading = false }: AddressSearchProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPlacesApi, setHasPlacesApi] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<Autocomplete | null>(null);

  // Load Google Maps script on component mount
  useEffect(() => {
    loadGoogleMapsScript();
    
    // Check if the Places API is available
    const checkPlacesApi = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setHasPlacesApi(true);
        clearInterval(checkPlacesApi);
      }
    }, 100);
    
    return () => clearInterval(checkPlacesApi);
  }, []);

  // Initialize autocomplete when the Places API is available
  useEffect(() => {
    if (!hasPlacesApi || !inputRef.current || !window.google?.maps?.places) return;
    
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    
    const autocomplete = autocompleteRef.current;
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        setAddress(place.formatted_address);
        setError(null);
      }
    });
  }, [hasPlacesApi]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }
    
    // Basic address validation
    if (address.length < 5) {
      setError('Please enter a valid address');
      return;
    }
    
    // If we have the Places API, get the place data
    if (hasPlacesApi && autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      // If the user selected a place from the dropdown
      if (place && place.geometry) {
        onSearch(address, place);
        return;
      }
    }
    
    // If we don't have the Places API or the user didn't select from dropdown,
    // just use the text input
    onSearch(address);
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter property address"
            className="pl-9"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!hasPlacesApi && (
        <p className="text-xs text-muted-foreground mt-1">
          Address autocomplete unavailable. Please enter a complete address.
        </p>
      )}
    </div>
  );
} 