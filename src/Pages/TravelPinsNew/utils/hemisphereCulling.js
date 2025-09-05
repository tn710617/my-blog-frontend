/**
 * Hemisphere-based culling for Mapbox HTML markers on globe-like views.
 * Hides DOM markers located on the far side relative to current map center.
 * Pure DOM updates; no React state changes to avoid reloads.
 */

const deg2rad = (deg) => (deg * Math.PI) / 180;

/**
 * Angular distance (degrees) between two [lng,lat] points.
 */
export const angularDistanceDeg = (a, b) => {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const φ1 = deg2rad(lat1);
  const φ2 = deg2rad(lat2);
  const λ1 = deg2rad(lng1);
  const λ2 = deg2rad(lng2);
  const dλ = λ2 - λ1;
  const x = Math.cos(φ2) * Math.sin(dλ);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  const numerator = Math.sqrt(x * x + y * y);
  const denominator = Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(dλ);
  const angle = Math.atan2(numerator, Math.max(-1, Math.min(1, denominator)));
  return (angle * 180) / Math.PI;
};

const computeCutoffDeg = (zoom = 2, pitch = 0) => {
  // Hemisphere boundary with small margin to avoid horizon flicker.
  const margin = 2; // degrees
  const pitchAdj = Math.min(10, pitch * 0.05);
  const zoomAdj = Math.min(5, Math.max(0, (zoom - 3) * 0.5));
  return 90 - pitchAdj - zoomAdj + margin;
};

export const isBehindGlobe = (centerLngLat, targetLngLat, zoom = 2, pitch = 0) => {
  const distance = angularDistanceDeg(centerLngLat, targetLngLat);
  const cutoff = computeCutoffDeg(zoom, pitch);
  return distance > cutoff;
};

/**
 * Update visibility for existing markers in-place.
 */
export const updateMarkerHemisphereVisibility = (pins, map, markersByIdRef) => {
  if (!map || !pins?.length) return;
  const center = map.getCenter?.();
  if (!center) return;
  const centerArr = [center.lng, center.lat];
  const zoom = map.getZoom?.() ?? 2;
  const pitch = map.getPitch?.() ?? 0;

  pins.forEach((pin) => {
    const marker = markersByIdRef.current?.get(pin.id);
    const el = marker?.getElement?.();
    if (!el) return;

    const hidden = isBehindGlobe(centerArr, pin.coordinates, zoom, pitch);
    if (hidden) {
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      try {
        const popup = marker.getPopup?.();
        if (popup && popup.isOpen && popup.isOpen()) popup.remove();
      } catch {}
    } else {
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
    }
  });
};