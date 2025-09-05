import { useEffect } from 'react';
import { useMapStore } from '../stores/mapStore';
import { flyToLocation, ZOOM_LEVELS } from '../utils/cameraHelpers';

/**
 * Custom hook to handle location selection from navbar search functionality for TravelPinsNew
 * Listens for 'travelPinsLocationSelect' custom events and navigates the map to the selected location
 * 
 * @returns {void}
 */
export function useLocationListener() {
  const { mapInstance } = useMapStore();

  useEffect(() => {
    const handleLocationFromNavbar = (event) => {
      const location = event.detail;
      
      // Navigate to the location on the map
      if (mapInstance && location.center) {
        const [longitude, latitude] = location.center;
        
        // Use appropriate zoom level: coordinate search vs place search
        let zoom;
        if (location.place_type?.includes('coordinate')) {
          // Coordinate search: use street level for precise location
          zoom = ZOOM_LEVELS.STREET;
        } else {
          // Place search: use original logic
          if (location.place_type?.includes('country')) {
            zoom = ZOOM_LEVELS.COUNTRY;
          } else if (location.place_type?.includes('region') || location.place_type?.includes('place')) {
            zoom = ZOOM_LEVELS.CITY;
          } else {
            zoom = ZOOM_LEVELS.COUNTRY; // fallback
          }
        }
        
        // Fly to the selected location with smooth animation
        flyToLocation(mapInstance, {
          longitude,
          latitude,
          zoom,
          duration: 2000
        });
      }
    };

    window.addEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    return () => {
      window.removeEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    };
  }, [mapInstance]);
}