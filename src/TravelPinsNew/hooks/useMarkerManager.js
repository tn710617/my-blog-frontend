// Hook to manage markers on the map
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../stores/mapStore';
import { useTravelPins } from './useTravelPinsApi';
import { 
  createMarkerElement, 
  addMarkerHoverEffects, 
  isMarkerVisible 
} from '../utils/markerUtils';
import { 
  assignColorsByScreen, 
  recolorMarkers, 
  createColorAssignmentRef,
  getColorAssignment
} from '../utils/colorManager';
import { createPopup, updatePopup } from '../utils/popupFactory';
import { markdownToHtml } from '../utils/markdownUtils';

export const useMarkerManager = () => {
  const { mapInstance, isMapReady } = useMapStore();
  const { data: pins = [], isLoading } = useTravelPins();
  
  // Keep track of markers and color assignments (using existing pattern)
  const markersRef = useRef(new Map()); // pinId -> marker instance
  const colorAssignmentsRef = useRef(createColorAssignmentRef()); // pinId -> color assignment
  
  // Marker visibility state
  const [hiddenMarkers, setHiddenMarkers] = useState(new Set());

  // Create/update markers when pins or map changes
  useEffect(() => {
    if (!isMapReady || !mapInstance || isLoading) return;

    // Clean up existing markers
    clearAllMarkers();

    // Calculate color assignments FIRST, before creating markers
    assignColorsByScreen(pins, mapInstance, colorAssignmentsRef.current);

    // Create markers for all pins (now with correct color assignments)
    pins.forEach((pin) => {
      createMarkerForPin(pin);
    });

    // Set up map event listeners for visibility and color updates
    const handleMapMove = () => {
      updateMarkerVisibility();
      // Update colors based on screen proximity when map moves/zooms
      recolorMarkers(pins, mapInstance, markersRef, colorAssignmentsRef);
    };
    
    mapInstance.on('move', handleMapMove);
    mapInstance.on('zoom', handleMapMove);
    mapInstance.on('rotate', handleMapMove);
    mapInstance.on('pitch', handleMapMove);

    return () => {
      mapInstance.off('move', handleMapMove);
      mapInstance.off('zoom', handleMapMove);  
      mapInstance.off('rotate', handleMapMove);
      mapInstance.off('pitch', handleMapMove);
    };
  }, [pins, isMapReady, mapInstance, isLoading]);

  // Create a marker for a single pin
  const createMarkerForPin = (pin) => {
    if (!pin.coordinates || !mapInstance) return;

    try {
      // Get color assignment from the sophisticated color manager
      const colorAssignment = getColorAssignment(pin.id, colorAssignmentsRef.current);
      
      // Create marker element
      const el = createMarkerElement(pin, colorAssignment);
      
      // Add hover effects
      addMarkerHoverEffects(el);
      
      // Add click handler for popup (Phase 4 will implement popup)
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Marker clicked:', pin.title); // TODO: Phase 4 - Open popup
      });

      // Initial hemisphere visibility check (avoid showing back-side markers at first paint)
      try {
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        const pitch = mapInstance.getPitch();
        if (center && typeof zoom === 'number' && typeof pitch === 'number') {
          const hidden = !isMarkerVisible(pin.coordinates, center, zoom, pitch);
          if (hidden) {
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
          }
        }
      } catch (error) {
        // Silently handle errors to prevent disrupting user experience
      }

      // Create Mapbox marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(pin.coordinates)
        .addTo(mapInstance);

      // Store marker reference
      markersRef.current.set(pin.id, marker);

    } catch (error) {
      console.error('Failed to create marker for pin:', pin.id, error);
    }
  };

  // Update marker visibility based on hemisphere culling
  const updateMarkerVisibility = () => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    const pitch = mapInstance.getPitch();
    const newHiddenMarkers = new Set();

    markersRef.current.forEach((marker, pinId) => {
      const pin = pins.find(p => p.id === pinId);
      if (!pin) return;

      const shouldBeVisible = isMarkerVisible(pin.coordinates, center, zoom, pitch);
      const markerElement = marker.getElement();

      if (shouldBeVisible) {
        markerElement.style.visibility = 'visible';
        markerElement.style.pointerEvents = 'auto';
      } else {
        markerElement.style.visibility = 'hidden';
        markerElement.style.pointerEvents = 'none';
        newHiddenMarkers.add(pinId);
      }
    });

    setHiddenMarkers(newHiddenMarkers);
  };

  // Clear all markers from map
  const clearAllMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current.clear();
  };

  // Add a new marker (for when pins are created)
  const addMarker = (pin) => {
    if (markersRef.current.has(pin.id)) return; // Already exists
    
    // Recalculate colors for all markers since adding one might affect proximity
    const updatedPins = [...pins, pin];
    assignColorsByScreen(updatedPins, mapInstance, colorAssignmentsRef.current);
    
    createMarkerForPin(pin);
    
    // Recolor existing markers in case proximity changed
    recolorMarkers(updatedPins, mapInstance, markersRef, colorAssignmentsRef);
  };

  // Remove a marker (for when pins are deleted)
  const removeMarker = (pinId) => {
    const marker = markersRef.current.get(pinId);
    if (marker) {
      marker.remove();
      markersRef.current.delete(pinId);
      colorAssignmentsRef.current.delete(pinId);
      
      // Recalculate colors for remaining markers since removing one might affect proximity
      const remainingPins = pins.filter(p => p.id !== pinId);
      if (remainingPins.length > 0) {
        assignColorsByScreen(remainingPins, mapInstance, colorAssignmentsRef.current);
        recolorMarkers(remainingPins, mapInstance, markersRef, colorAssignmentsRef);
      }
    }
  };

  // Update an existing marker (for when pins are edited)
  const updateMarker = (pin) => {
    removeMarker(pin.id);
    addMarker(pin);
  };

  // Get marker by pin ID
  const getMarker = (pinId) => {
    return markersRef.current.get(pinId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllMarkers();
    };
  }, []);

  return {
    markers: markersRef.current,
    hiddenMarkers,
    addMarker,
    removeMarker,
    updateMarker,
    getMarker,
    updateMarkerVisibility,
  };
};