import mapboxgl from 'mapbox-gl';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from './palettes';
import { buildFootprintHTML } from './footprintIcon';
import { Z_INDEX_CSS } from './zIndex';

/**
 * Creates a Mapbox marker element for a travel pin
 * @param {Object} pin - The travel pin data
 * @param {number} index - Index of the pin (unused but kept for compatibility)
 * @param {Object} map - The Mapbox map instance
 * @param {Object} assignedColorsRef - Reference to color assignments
 * @param {Object} mapboxModalActiveRef - Reference to modal active state
 * @param {Function} createEnhancedPopup - Function to create popup for the pin
 * @returns {mapboxgl.Marker|null} The created marker or null if creation failed
 */
export const createMarkerForPin = (
  pin, 
  index, 
  map, 
  assignedColorsRef, 
  mapboxModalActiveRef,
  createEnhancedPopup
) => {
  // Defensive check: ensure map is available and ready
  if (!map) {
    console.error('createMarkerForPin called with undefined map:', { pin: pin.id, map });
    return null;
  }

  // Additional check: ensure map has a valid container and is loaded (skip in test environment)
  if (process.env.NODE_ENV !== 'test') {
    const mapContainer = map.getContainer?.();
    if (!mapContainer || !mapContainer.parentNode) {
      console.warn('createMarkerForPin called but map container is not attached to DOM:', { 
        pin: pin.id, 
        hasContainer: !!mapContainer,
        hasParent: !!mapContainer?.parentNode 
      });
      // Don't return null - allow marker creation to continue
    }
    
    // More lenient check: only fail if map is clearly not initialized
    if (!map.loaded?.() && !map.isStyleLoaded?.()) {
      console.warn('createMarkerForPin called but map may not be fully loaded:', { 
        pin: pin.id,
        mapLoaded: map.loaded?.(),
        styleLoaded: map.isStyleLoaded?.()
      });
      // Don't return null - allow marker creation to continue
    }
  }

  // Create marker element
  const el = document.createElement('div');
  el.className = 'travel-pin-marker';
  
  // Debug logging for marker creation
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating marker for pin:', {
      pinId: pin.id,
      coordinates: pin.coordinates,
      mapContainer: !!map.getContainer?.(),
      mapLoaded: map.loaded?.(),
      styleLoaded: map.isStyleLoaded?.()
    });
  }
  
  // Choose assigned palette for this pin
  const assignment = assignedColorsRef.current.get(pin.id) || { palette: 'skin', idx: 1 };
  const idx = assignment.idx;
  const palette = assignment.palette;
  const schemeList = palette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
  const scheme = schemeList[idx] || schemeList[0];
  el.dataset.colorIdx = String(idx);
  el.dataset.palette = palette;

  // Inject the chosen style HTML
  setMarkerInnerHTML(el, scheme);
  
  // Use exact same CSS as accurate debug crosshair
  // Default fully opaque; we only lower opacity on hover
  // Use centralized z-index management to stay below Mapbox notification modals
  el.style.cssText = `position: absolute; pointer-events: auto; cursor: pointer; z-index: ${Z_INDEX_CSS.MAP_MARKER_DEFAULT}; opacity: 1;`;

  // Hover effect (disabled when Mapbox gesture modal is active)
  const getContainer = () => el.querySelector('.marker-container');
  el.addEventListener('mouseenter', () => {
    // Don't apply hover effects when Mapbox gesture modal is active
    if (mapboxModalActiveRef.current) return;
    
    const container = getContainer();
    if (container) container.style.transform = 'scale(1.12)';
    // Keep below form overlay, popup overlay, and Mapbox notification modals
    el.style.zIndex = Z_INDEX_CSS.MAP_MARKER_HOVER;
    el.style.opacity = '0.65';
  });

  el.addEventListener('mouseleave', () => {
    // Always reset on mouse leave to prevent stuck states
    const container = getContainer();
    if (container) container.style.transform = 'scale(1)';
    el.style.zIndex = Z_INDEX_CSS.MAP_MARKER_DEFAULT;
    el.style.opacity = '1';
  });

  const popup = createEnhancedPopup(pin);

  try {
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center' // Use same anchor strategy as accurate crosshair
    })
      .setLngLat(pin.coordinates)
      .setPopup(popup);

    // Add click event to show popup (after marker is created)
    el.addEventListener('click', (e) => {
      // Prevent marker interaction when Mapbox gesture modal is active
      if (mapboxModalActiveRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      e.stopPropagation(); // Prevent map click event
      marker.togglePopup(); // Show the popup
    });

    marker.addTo(map);
    return marker;
  } catch (error) {
    console.error('Failed to create/add marker:', { pin: pin.id, error: error.message });
    return null;
  }
};

/**
 * Helper to set footprint HTML on marker element
 */
const setMarkerInnerHTML = (el, scheme) => {
  el.innerHTML = buildFootprintHTML(scheme);
};