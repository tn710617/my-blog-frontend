import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '../stores/mapStore';
import { Z_INDEX } from '../utils/zIndex';

const MapContainer = () => {
  const mapContainerRef = useRef(null);
  
  // Map store
  const { 
    setMapInstance, 
    setMapError,
    isMobileGestureMode,
    setMapRootEl,
  } = useMapStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      // Detect mobile device for positioning (following existing pattern)
      const isMobile = window.innerWidth <= 768;
      
      // Adjust center position for mobile - move earth higher (more negative latitude)
      const center = isMobile ? [0, -15] : [0, 0];
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Keep satellite style for consistency
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
        cooperativeGestures: isMobileGestureMode === 'scroll' ? true : false,
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

      // NOTE: Removed built-in NavigationControl and GeolocateControl to avoid 
      // non-passive touchmove event warnings. The original implementation uses
      // custom overlay controls instead (Phase 12 - Search controls overlay)

      // NOTE: Phase 3 - Markers are managed by MarkersManager component
      // TODO: Phase 4 - Set up popup event listeners (map.on('click'))

      // Cleanup function
      return () => {
        map.remove();
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(error.message || 'Failed to initialize map');
    }
  }, [setMapInstance, setMapError, isMobileGestureMode]);

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
      {/* TODO: Phase 12 - Custom overlay controls (GPS location button, etc.)
          Following original pattern to avoid touchmove passive event warnings */}
    </div>
  );
};

export default MapContainer;
