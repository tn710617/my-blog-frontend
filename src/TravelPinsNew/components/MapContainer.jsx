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
    isMobileGestureMode
  } = useMapStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [0, 0],
        zoom: 1,
        projection: 'globe', // 3D globe projection
        cooperativeGestures: window.innerWidth <= 768 ? isMobileGestureMode === 'scroll' : false,
      });

      // Map load event
      map.on('load', () => {
        setMapInstance(map);
        
        // Set mobile padding for better globe positioning
        if (window.innerWidth <= 768) {
          map.setPadding({ bottom: 100 });
        }
        
        console.log('Map loaded successfully');
      });

      // Map error event
      map.on('error', (event) => {
        console.error('Map error:', event.error);
        setMapError(event.error?.message || 'Failed to load map');
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add geolocation control
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false,
        showUserHeading: false,
        showAccuracyCircle: false
      }), 'top-right');

      // TODO: Phase 3 - Add markers to map here (map.addSource/addLayer)
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

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full h-full"
      style={{ zIndex: Z_INDEX.MAP }}
    >
      {/* TODO: Phase 12 - Search controls overlay */}
      {/* TODO: Phase 15 - Geolocation button (if not using built-in control) */}
    </div>
  );
};

export default MapContainer;