import React from 'react';
import { useMapStore } from './stores/mapStore';
import MapContainer from './components/MapContainer';
import MapLoadingIndicator from './components/MapLoadingIndicator';
import MobileGestureToggle from './components/MobileGestureToggle';
import SymbolsManager from './components/SymbolsManager';
import BackgroundOverlay from './components/BackgroundOverlay';
import DeleteConfirmationModal from './components/Modals/DeleteConfirmationModal';
import PhotoModal from './components/Modals/PhotoModal';
import EditPinModal from './components/Modals/EditPinModal';
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers';
import { handleResize } from './utils/cameraHelpers';

// Travel Pins New - Main Component
// Entry point for the new Travel Pins implementation
const TravelPinsNew = () => {
  const { mapInstance } = useMapStore();
  // Centralized ESC handling (delete/photo/display)
  useKeyboardHandlers();

  // Handle window resize for map responsiveness
  React.useEffect(() => {
    const onResize = () => handleResize(mapInstance);
    window.addEventListener('resize', onResize);
    
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [mapInstance]);

  return (
    <div className="h-screen flex flex-col relative">
      {/* Phase 2 - Map Container */}
      <div className="flex-1 relative">
        <MapContainer />
        <MapLoadingIndicator />
        <MobileGestureToggle />
        
        {/* SymbolLayer-based pins (no backside flicker) */}
        <SymbolsManager />
        <BackgroundOverlay />
        <DeleteConfirmationModal />
        <PhotoModal />
        <EditPinModal />
      </div>
      
      {/* TODO: Phase 4 - Display Popup */}
      {/* TODO: Phase 5 - React Modals */}
      {/* TODO: Phase 6 - Background Overlay */}
    </div>
  );
};

export default TravelPinsNew;
