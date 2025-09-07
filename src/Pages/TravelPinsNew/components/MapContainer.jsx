import React, { useRef, useEffect, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '../stores/mapStore';
import { Z_INDEX } from '../utils/zIndex';
import { useResponsive } from '../hooks/useResponsive';

const MapContainer = () => {
  const mapContainerRef = useRef(null);
  
  // Map store
  const { 
    setMapInstance, 
    setMapError,
    isMobileGestureMode,
    setMapRootEl,
  } = useMapStore();

  // Use responsive hook for consistent mobile detection
  const isMobile = useResponsive();

  // Derive a stable dependency key: desktop forces cooperative gestures
  const coopKey = useMemo(() => (isMobile ? isMobileGestureMode : 'desktop'), [isMobile, isMobileGestureMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      // Ensure the container is empty before initializing the map
      // Mapbox warns and may degrade interactivity if the container has any nodes
      const containerEl = mapContainerRef.current;
      if (containerEl && containerEl.firstChild) {
        try {
          while (containerEl.firstChild) {
            containerEl.removeChild(containerEl.firstChild);
          }
        } catch {}
      }

      // Adjust center position for mobile - move earth higher (slightly more negative latitude)
      const center = isMobile ? [0, -90] : [0, 0];
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12', // Keep satellite style for consistency
        center: center,
        zoom: 2, // Start at zoom 2 like original
        projection: 'globe', // 3D globe projection
        // Prevent duplicate world copies which can briefly show back-side markers
        renderWorldCopies: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
        doubleClickZoom: true,
        touchZoomRotate: true,  // Enables two-finger zoom and rotate on mobile
        dragRotate: true,       // Allows rotation with mouse + modifier key on desktop
        dragPan: true,          // Desktop pan with mouse
        keyboard: true,
        touchPitch: true,       // Two-finger pitch/tilt on mobile
        pitchWithRotate: true,  // Enable pitch when rotating
        // Desktop: always cooperative gestures; Mobile: follow toggle mode
        cooperativeGestures: !isMobile || isMobileGestureMode === 'scroll',
      });

      // Map load event
      map.on('load', () => {
        setMapInstance(map);
        console.log('Map loaded successfully');
      });

      // Map error event
      map.on('error', (event) => {
        console.error('Map error:', event.error);
        setMapError(event.error?.message || 'Failed to load map');
      });

      // Cleanup: remove map and clear store instance to avoid stale references
      return () => {
        try {
          map.remove();
        } catch {}
        // Ensure downstream effects (e.g., SymbolsManager) don't act on a removed map
        try { setMapInstance(null); } catch {}
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(error.message || 'Failed to initialize map');
    }
  }, [setMapInstance, setMapError, coopKey]);

  // Expose root element for portals like overlay
  useEffect(() => {
    if (mapContainerRef.current) setMapRootEl(mapContainerRef.current);
    return () => setMapRootEl(null);
  }, [setMapRootEl]);

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full h-full"
      style={{ zIndex: Z_INDEX.MAP, position: 'relative' }}
    >
    </div>
  );
};

export default MapContainer;
