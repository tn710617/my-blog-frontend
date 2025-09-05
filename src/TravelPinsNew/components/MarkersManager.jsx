import React from 'react';
import { useMarkerManager } from '../hooks/useMarkerManager';

// Markers Manager Component
// Handles all marker-related logic and lifecycle management
const MarkersManager = () => {
  const {
    markers,
    hiddenMarkers,
    addMarker,
    removeMarker, 
    updateMarker,
  } = useMarkerManager();

  // This component doesn't render anything visually
  // All markers are added directly to the Mapbox map instance
  // The hook handles all the logic

  // Debug info (development only)
  if (process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      console.log('MarkersManager: Active markers:', markers.size);
      console.log('MarkersManager: Hidden markers:', hiddenMarkers.size);
    }, [markers.size, hiddenMarkers.size]);
  }

  return null; // No visual component needed
};

export default MarkersManager;