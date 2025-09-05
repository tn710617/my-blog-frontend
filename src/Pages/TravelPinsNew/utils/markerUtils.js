// Marker utilities for Travel Pins New
// Refactored to use existing utilities and fix rotation issues

import { Z_INDEX } from './zIndex';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from './palettes';
import { buildFootprintHTML } from './footprintIcon';
import { isBehindGlobe } from './hemisphereCulling';

// Create marker HTML element (reusing existing pattern)
export const createMarkerElement = (pin, colorAssignment = { palette: 'skin', idx: 1 }) => {
  const el = document.createElement('div');
  el.className = 'travel-pin-marker';
  el.dataset.pinId = pin.id;
  el.dataset.palette = colorAssignment.palette;
  el.dataset.colorIdx = String(colorAssignment.idx);

  // Get color scheme from existing palettes
  const schemeList = colorAssignment.palette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
  const scheme = schemeList[colorAssignment.idx] || schemeList[1]; // Default to medium skin

  // Build marker HTML with existing footprint utility
  el.innerHTML = buildFootprintHTML(scheme);

  // Apply base styles (matching existing implementation)
  // IMPORTANT: Use 'position: absolute' to fix rotation issue
  el.style.cssText = `
    position: absolute; 
    pointer-events: auto; 
    cursor: pointer; 
    z-index: ${Z_INDEX.MARKERS}; 
    opacity: 1;
    /* Start hidden to avoid any initial back-side flicker; manager reveals correctly */
    visibility: hidden;
    pointer-events: none;
  `;

  return el;
};

// Add hover effects to marker (reusing existing pattern)
export const addMarkerHoverEffects = (el, isDisabled = false) => {
  if (isDisabled) return;

  const getContainer = () => el.querySelector('.marker-container');

  el.addEventListener('mouseenter', () => {
    const container = getContainer();
    if (container) container.style.transform = 'scale(1.12)';
    el.style.zIndex = Z_INDEX.MARKER_HOVER;
    el.style.opacity = '0.65';
  });

  el.addEventListener('mouseleave', () => {
    const container = getContainer();
    if (container) container.style.transform = 'scale(1)';
    el.style.zIndex = Z_INDEX.MARKERS;
    el.style.opacity = '1';
  });
};

// Note: Color assignment is now handled by the sophisticated color management system
// in ../../Pages/TravelPins/utils/colorManager.js which handles screen-space proximity detection

// Use existing hemisphere culling logic
export const isMarkerVisible = (pinCoordinates, mapCenter, mapZoom, mapPitch = 0) => {
  if (!pinCoordinates || !mapCenter) return true;
  
  try {
    const center = [mapCenter.lng || mapCenter[0], mapCenter.lat || mapCenter[1]];
    return !isBehindGlobe(center, pinCoordinates, mapZoom, mapPitch);
  } catch (error) {
    // Fallback to simple distance check if hemisphere culling fails
    const [pinLng, pinLat] = pinCoordinates;
    const centerLng = mapCenter.lng || mapCenter[0];
    const centerLat = mapCenter.lat || mapCenter[1];
    
    const lngDiff = Math.abs(pinLng - centerLng);
    const latDiff = Math.abs(pinLat - centerLat);
    
    // At low zoom levels, hide markers that are too far away
    if (mapZoom < 2) {
      return lngDiff < 90 && latDiff < 90;
    }
    
    return true;
  }
};
