import { useState } from 'react';
import { useIntl } from 'react-intl';

/**
 * Custom hook for handling geolocation functionality
 * Manages GPS location fetching, loading states, and error handling
 */
export const useGeolocation = () => {
  const intl = useIntl();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  /**
   * Get user's current location and execute callback with coordinates
   * @param {Function} onSuccess - Callback function that receives { latitude, longitude }
   * @param {Object} options - Optional geolocation options
   */
  const getCurrentLocation = (onSuccess, options = {}) => {
    if (!navigator.geolocation) {
      setLocationError(intl.formatMessage({ id: 'travel_pins.location.not_supported' }));
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
        console.error('📍 Geolocation error:', error);
        setIsLocating(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(intl.formatMessage({ id: 'travel_pins.location.permission_denied' }));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(intl.formatMessage({ id: 'travel_pins.location.position_unavailable' }));
            break;
          case error.TIMEOUT:
            setLocationError(intl.formatMessage({ id: 'travel_pins.location.timeout' }));
            break;
          default:
            setLocationError(intl.formatMessage({ id: 'travel_pins.location.unknown_error' }));
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