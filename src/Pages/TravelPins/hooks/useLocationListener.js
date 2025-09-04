import { useEffect, useState } from 'react';

/**
 * Custom hook to handle location-related event listeners for the TravelPins component.
 * Manages:
 * - Mobile/desktop detection via resize events
 * - Location selection from navbar search functionality
 * - Search history management
 * 
 * @param {Object} map - Mapbox map instance
 * @param {Function} flyTo - Function to fly to a location on the map
 * @returns {Object} - { isMobile, searchHistory }
 */
export function useLocationListener(map, flyTo) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchHistory, setSearchHistory] = useState([]);

  // Mobile detection effect
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Listen for location selection from navbar search
  useEffect(() => {
    const handleLocationFromNavbar = (event) => {
      const location = event.detail;
      
      console.log('🔍 Location selected from navbar:', location);
      console.log('📍 Map instance available:', !!map);
      console.log('🎯 Location center:', location.center);
      
      // Navigate to the location on the map
      if (map && location.center) {
        console.log('🚀 Calling flyTo with coordinates:', location.center);
        flyTo(location.center, 10, 2000);
        
        // Add to search history
        const historyItem = {
          id: Date.now(),
          name: location.place_name,
          coordinates: location.center,
          timestamp: new Date()
        };
        
        setSearchHistory(prev => {
          const filtered = prev.filter(item => item.name !== historyItem.name);
          return [historyItem, ...filtered].slice(0, 5);
        });
      } else {
        console.log('❌ Cannot navigate: map=' + !!map + ', location.center=' + !!location.center);
      }
    };

    window.addEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    return () => {
      window.removeEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    };
  }, [flyTo, map]);

  return {
    isMobile,
    searchHistory
  };
}