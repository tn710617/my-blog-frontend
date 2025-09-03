import { SKIN_SCHEMES, CONTRAST_SCHEMES } from './palettes';
import { buildFootprintHTML } from './footprintIcon';

/**
 * Color Management System for Travel Pins
 * 
 * This module handles the assignment of distinct colors to map markers based on
 * screen-space proximity detection. When markers are close together visually,
 * they get contrast colors to remain distinguishable.
 */

/**
 * Assign distinct colors based on screen-space proximity (zoom-aware, DOM-only updates)
 * 
 * @param {Array} allPins - Array of pin objects with id and coordinates
 * @param {Object} map - Mapbox map instance for screen coordinate projection
 * @param {Map} assignedColorsRef - Reference map to store color assignments
 * @returns {Map} Map of pin IDs to color assignments
 */
export const assignColorsByScreen = (allPins, map, assignedColorsRef) => {
  if (!map) return assignedColorsRef;
  
  const thresholdPx = 28; // consider markers within ~28px as "very close"
  const points = allPins.map(p => ({ 
    id: p.id, 
    coords: p.coordinates, 
    pxy: map.project({ lng: p.coordinates[0], lat: p.coordinates[1] }) 
  }));
  const sorted = [...points].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const byId = new Map();
  
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const neighborColors = new Set();
    let hasNeighbor = false;
    
    for (let j = 0; j < i; j++) {
      const prev = sorted[j];
      const dx = cur.pxy.x - prev.pxy.x;
      const dy = cur.pxy.y - prev.pxy.y;
      const dist2 = dx * dx + dy * dy;
      
      if (dist2 <= thresholdPx * thresholdPx) {
        hasNeighbor = true;
        const prevAssign = byId.get(prev.id);
        if (prevAssign && prevAssign.palette === 'contrast') {
          neighborColors.add(prevAssign.idx);
        }
      }
    }
    
    if (!hasNeighbor) {
      // default skin tone index 1 (medium)
      byId.set(cur.id, { palette: 'skin', idx: 1 });
    } else {
      // choose first available contrast color index
      let chosen = 0;
      for (let k = 0; k < CONTRAST_SCHEMES.length; k++) {
        if (!neighborColors.has(k)) { 
          chosen = k; 
          break; 
        }
      }
      byId.set(cur.id, { palette: 'contrast', idx: chosen });
    }
  }
  
  // Update the reference map
  assignedColorsRef.clear();
  byId.forEach((value, key) => assignedColorsRef.set(key, value));
  
  return assignedColorsRef;
};

/**
 * Recolor existing markers in-place without touching React state
 * 
 * @param {Array} pins - Array of pin objects
 * @param {Object} map - Mapbox map instance
 * @param {Map} markersByIdRef - Reference map of markers by ID
 * @param {Map} assignedColorsRef - Reference map of color assignments
 */
export const recolorMarkers = (pins, map, markersByIdRef, assignedColorsRef) => {
  if (!map) return;
  
  try {
    assignColorsByScreen(pins, map, assignedColorsRef);
    
    pins.forEach((pin) => {
      const marker = markersByIdRef.get(pin.id);
      if (!marker) return;
      
      const el = marker.getElement?.();
      if (!el) return;
      
      const assignment = assignedColorsRef.get(pin.id) || { palette: 'skin', idx: 1 };
      const curIdx = Number(el.dataset.colorIdx ?? -1);
      const curPalette = el.dataset.palette || '';
      const newPalette = assignment.palette;
      const idx = assignment.idx;
      
      if (idx === curIdx && curPalette === newPalette) return;
      
      el.dataset.colorIdx = String(idx);
      el.dataset.palette = newPalette;
      const schemeList = newPalette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
      const scheme = schemeList[idx] || schemeList[0];
      el.innerHTML = buildFootprintHTML(scheme);
    });
  } catch (error) {
    // Silently handle errors to prevent disrupting user experience
  }
};

/**
 * Get color assignment for a specific pin
 * 
 * @param {string|number} pinId - The pin ID
 * @param {Map} assignedColorsRef - Reference map of color assignments
 * @returns {Object} Color assignment object with palette and idx
 */
export const getColorAssignment = (pinId, assignedColorsRef) => {
  return assignedColorsRef.get(pinId) || { palette: 'skin', idx: 1 };
};

/**
 * Create a new color assignment reference map
 * 
 * @returns {Map} New Map for storing color assignments
 */
export const createColorAssignmentRef = () => {
  return new Map();
};