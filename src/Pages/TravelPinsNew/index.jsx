import React from 'react';
import { useMapStore } from './stores/mapStore';
import MapContainer from './components/MapContainer';
import MapLoadingIndicator from './components/MapLoadingIndicator';
import MobileGestureToggle from './components/MobileGestureToggle';
import SymbolsManager from './components/SymbolsManager';
import OverlayRoot from './components/OverlayRoot';
import LocationButton from './components/LocationButton';
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers';
import { useLocationListener } from './hooks/useLocationListener';
import { useGeolocation } from './hooks/useGeolocation';
import { handleResize } from './utils/cameraHelpers';
import { useResponsive } from './hooks/useResponsive';

// Travel Pins New - Main Component
// Entry point for the new Travel Pins implementation
const TravelPinsNew = () => {
  const { mapInstance } = useMapStore();
  const isMobile = useResponsive();
  
  // Centralized ESC handling (delete/photo/display)
  useKeyboardHandlers();
  
  // Listen for location selection from navbar search
  useLocationListener();
  
  // Geolocation hook for GPS positioning
  const { isLocating, locationError, getCurrentLocation, clearLocationError } = useGeolocation();
  
  // Handle GPS location button click
  const handleGetCurrentLocation = React.useCallback(() => {
    if (!mapInstance) return;
    
    getCurrentLocation(({ latitude, longitude }) => {
      // Use easeTo for smooth movement, zoom to street level
      mapInstance.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(15, mapInstance.getZoom()), // Street level, but don't zoom out if already closer
        duration: 2500
      });
    });
  }, [mapInstance, getCurrentLocation]);

  // Handle window resize for map responsiveness
  React.useEffect(() => {
    const onResize = () => handleResize(mapInstance, isMobile);
    window.addEventListener('resize', onResize);
    
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [mapInstance, isMobile]);

  // 不再使用 setPadding 調整地球位置，避免 globe 底部灰色圓形重疊

  return (
    <div className="h-screen flex flex-col relative">
      {/* Phase 2 - Map Container */}
      <div className="flex-1 relative">
        <MapContainer />
        <MapLoadingIndicator />
        <MobileGestureToggle />
        
        {/* SymbolLayer-based pins (no backside flicker) */}
        <SymbolsManager />
        <OverlayRoot />
        
        {/* Phase 14 - Location Button */}
        <LocationButton
          isLocating={isLocating}
          locationError={locationError}
          onGetCurrentLocation={handleGetCurrentLocation}
          onClearLocationError={clearLocationError}
        />
        
        {/* Dialog contents are now rendered by OverlayRoot */}
      </div>
      
      {/* TODO: Phase 4 - Display Popup */}
      {/* TODO: Phase 5 - React Modals */}
      {/* TODO: Phase 6 - Background Overlay */}
    </div>
  );
};

export default TravelPinsNew;
