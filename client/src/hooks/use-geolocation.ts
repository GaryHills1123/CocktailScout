import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
    loading: false,
    permission: 'unknown'
  });

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reverse geocoding response:', data); // Debug log
      
      // Extract city name from various possible fields
      const city = data.address?.city || 
                  data.address?.town || 
                  data.address?.village || 
                  data.address?.municipality ||
                  data.address?.county ||
                  null;
      
      console.log('Detected city:', city); // Debug log
      return city;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'denied'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission first
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permission: permission.state as any }));
        
        if (permission.state === 'denied') {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Location access denied. Using Hamilton, ON as default location.'
          }));
          return;
        }
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 15000,
            maximumAge: options.maximumAge ?? 300000, // 5 minutes
            ...options
          }
        );
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      console.log('User location detected:', { latitude, longitude, accuracy: position.coords.accuracy });
      
      // Get city name via reverse geocoding
      const cityName = await reverseGeocode(latitude, longitude);
      
      // If reverse geocoding fails, create a descriptive location string
      const displayCity = cityName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setState({
        latitude,
        longitude,
        city: displayCity,
        error: null,
        loading: false,
        permission: 'granted'
      });

    } catch (error: any) {
      let errorMessage = 'Unable to get your location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Using Hamilton, ON as default location.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Using Hamilton, ON as default location.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timeout. Using Hamilton, ON as default location.';
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        permission: error.code === 1 ? 'denied' : prev.permission
      }));
    }
  };

  return {
    ...state,
    requestLocation
  };
}