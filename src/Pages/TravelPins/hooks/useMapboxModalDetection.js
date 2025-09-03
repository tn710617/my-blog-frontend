import { useState, useRef, useEffect } from 'react';
import { Z_INDEX_CSS } from '../utils/zIndex';

/**
 * Hook to detect and manage Mapbox cooperative gesture modal state
 */
export const useMapboxModalDetection = () => {
  const [mapboxModalActive, setMapboxModalActive] = useState(false);
  const mapboxModalActiveRef = useRef(false);

  // Initialize modal state to false on mount
  useEffect(() => {
    setMapboxModalActive(false);
    mapboxModalActiveRef.current = false;
  }, []);

  // Monitor for Mapbox cooperative gesture modal using opacity detection
  useEffect(() => {
    let lastOpacity = 0;
    
    const checkScrollZoomBlocker = () => {
      const scrollBlocker = document.querySelector('.mapboxgl-scroll-zoom-blocker');
      if (!scrollBlocker) return;
      
      const style = window.getComputedStyle(scrollBlocker);
      const opacity = parseFloat(style.opacity);
      const isActive = opacity > 0;
      
      // Only log when opacity changes
      if (opacity !== lastOpacity) {
        lastOpacity = opacity;
      }
      
      if (isActive && !mapboxModalActiveRef.current) {
        mapboxModalActiveRef.current = true;
        setMapboxModalActive(true);
        
        // Disable marker interactions and reset hover states
        const markers = document.querySelectorAll('.travel-pin-marker');
        
        markers.forEach(marker => {
          marker.style.cursor = 'default';
          marker.classList.add('modal-active-disabled');
          
          // Reset any existing hover states
          const container = marker.querySelector('.marker-container');
          if (container) container.style.transform = 'scale(1)';
          marker.style.zIndex = Z_INDEX_CSS.MAP_MARKER_DEFAULT;
          marker.style.opacity = '1';
        });
        
      } else if (!isActive && mapboxModalActiveRef.current) {
        mapboxModalActiveRef.current = false;
        setMapboxModalActive(false);
        
        // Re-enable marker interactions
        const markers = document.querySelectorAll('.travel-pin-marker');
        
        markers.forEach(marker => {
          marker.style.cursor = 'pointer';
          marker.classList.remove('modal-active-disabled');
        });
      }
    };

    // Check every 100ms for opacity changes
    const interval = setInterval(checkScrollZoomBlocker, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []); // No dependencies needed

  return {
    mapboxModalActive,
    mapboxModalActiveRef
  };
};