import { useEffect, useRef } from 'react';
import { assignColorsByScreen } from '../utils/colorManager';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from '../utils/palettes';
import { buildFootprintHTML } from '../utils/footprintIcon';
import { createEnhancedPopup } from '../utils/popupFactory';

/**
 * Hook to manage marker creation, updates and removal effects
 * @param {Object} options - Configuration options
 * @returns {Object} Effect handlers
 */
export const useMarkerEffects = ({
  map,
  mapLoaded,
  pins,
  assignedColorsRef,
  markersRef,
  markersByIdRef,
  createMarkerForPinWithDeps,
  handlePopupClose,
  createEnhancedPopupForPin
}) => {
  const isUpdatingRef = useRef(false);

  // Effect to create/update/remove markers when pins change
  useEffect(() => {
    if (isUpdatingRef.current) return; // Prevent recursive updates
    if (!map || !mapLoaded || !map.loaded?.()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('useMarkerEffects: skipping marker update', {
          hasMap: !!map,
          mapLoaded,
          mapLoadedFunc: map?.loaded?.(),
          pinsCount: pins.length
        });
      }
      return;
    }

    isUpdatingRef.current = true;

    // Compute screen-space color assignments up front
    try { 
      assignColorsByScreen(pins, map, assignedColorsRef.current); 
    } catch {}

    const markersById = markersByIdRef.current;

    const newIds = new Set(pins.map(p => p.id));
    const oldIds = new Set(markersByIdRef.current ? Array.from(markersById.keys()) : []);

    // Remove markers that no longer exist
    oldIds.forEach(id => {
      if (!newIds.has(id)) {
        const marker = markersById.get(id);
        if (marker) {
          marker.remove();
          // remove from markersRef list
          markersRef.current = markersRef.current.filter(m => m !== marker);
        }
        markersById.delete(id);
        // Also ensure it's removed from open popups set
        handlePopupClose(id);
      }
    });

    // Add or update markers for current pins
    pins.forEach((pin, index) => {
      const existing = markersById.get(pin.id);
      if (!existing) {
        const marker = createMarkerForPinWithDeps(pin, index, map);
        if (marker) {
          markersById.set(pin.id, marker);
          markersRef.current.push(marker);
          if (process.env.NODE_ENV === 'development') {
            console.log('useMarkerEffects: created new marker for pin', pin.id);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('useMarkerEffects: failed to create marker for pin', pin.id);
          }
        }
      } else {
        try {
          // Update coordinates only - temporarily disable popup updates to prevent infinite loops
          existing.setLngLat(pin.coordinates);
          
          // Refresh marker element HTML (ensures current footprint style)
          const el = existing.getElement();
          if (el) {
            const assignment = assignedColorsRef.current.get(pin.id) || { palette: 'skin', idx: 1 };
            const idx = assignment.idx;
            const palette = assignment.palette;
            el.dataset.colorIdx = String(idx);
            el.dataset.palette = palette;
            const schemeList = palette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
            const scheme = schemeList[idx] || schemeList[0];
            try { el.innerHTML = buildFootprintHTML(scheme); } catch {}
          }
          
          // TODO: Re-enable popup content updates once infinite loop is resolved
          // For now, popup content will only update when popup is manually closed/reopened
        } catch {}
      }
    });

    // Reset the flag after processing
    isUpdatingRef.current = false;

    return () => {
      // No-op here; global cleanup on unmount elsewhere
    };
  }, [
    map, 
    mapLoaded, 
    pins.length, 
    pins.map(p => `${p.id}-${p.updated_at}`).join(','), // More stable pins dependency
    createMarkerForPinWithDeps
    // Removed unstable dependencies: assignedColorsRef, markersRef, markersByIdRef, handlePopupClose
    // These are refs and functions that don't need to trigger re-runs
  ]);
};