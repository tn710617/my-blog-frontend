import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage scroll/rotation toggle state for both mobile and desktop
 * @param {Object} map - Mapbox map instance
 * @returns {Object} Toggle state and handlers
 */
export const useMobileToggle = (map) => {
  const [isRotationMode, setIsRotationMode] = useState(true); // Default to rotation mode
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile (for different interaction behavior)
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update map interaction based on toggle state
  const updateMapInteraction = useCallback((rotationMode) => {
    if (!map) return;

    try {
      if (rotationMode) {
        // Enable earth rotation mode - enable map interactions
        map.scrollZoom?.enable();
        map.dragPan?.enable();
        map.dragRotate?.enable();
        map.touchZoomRotate?.enable();
        map.touchPitch?.enable();
        
        // On mobile, prevent page scroll when interacting with map
        if (isMobile) {
          const mapContainer = map.getContainer();
          if (mapContainer) {
            mapContainer.style.touchAction = 'none';
          }
        }
      } else {
        // Enable page scroll mode - disable map interactions
        map.scrollZoom?.disable();
        map.dragPan?.disable();
        map.dragRotate?.disable();
        map.touchZoomRotate?.disable();
        map.touchPitch?.disable();
        
        // On mobile, allow page scroll
        if (isMobile) {
          const mapContainer = map.getContainer();
          if (mapContainer) {
            mapContainer.style.touchAction = 'auto';
          }
        }
      }
    } catch (error) {
      console.error('Failed to update map interaction:', error);
    }
  }, [map, isMobile]);

  // Handle toggle change
  const handleToggle = useCallback((newRotationMode) => {
    setIsRotationMode(newRotationMode);
    updateMapInteraction(newRotationMode);
  }, [updateMapInteraction]);

  // Initialize map interaction when map loads
  useEffect(() => {
    if (map) {
      updateMapInteraction(isRotationMode);
    }
  }, [map, isRotationMode, updateMapInteraction]);

  return {
    isRotationMode,
    isMobile,
    handleToggle
  };
};