import { useState } from 'react';

/**
 * Custom hook for handling geolocation functionality
 * Manages GPS location fetching, loading states, and error handling
 */
export const useGeolocation = () => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  /**
   * Get user's current location and execute callback with coordinates
   * @param {Function} onSuccess - Callback function that receives { latitude, longitude }
   * @param {Object} options - Optional geolocation options
   */
  const getCurrentLocation = (onSuccess, options = {}) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    const geolocationOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setIsLocating(false);
        setLocationError(null);
        
        if (onSuccess) {
          onSuccess({ latitude, longitude });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Unable to retrieve your location.');
            break;
        }
      },
      geolocationOptions
    );
  };

  /**
   * Clear the current location error
   */
  const clearLocationError = () => {
    setLocationError(null);
  };

  return {
    isLocating,
    locationError,
    getCurrentLocation,
    clearLocationError
  };
};