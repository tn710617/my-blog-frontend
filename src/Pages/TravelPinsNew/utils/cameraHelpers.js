// Camera helper utilities for Travel Pins New
// Provides programmatic map movement and viewport control

// Default animation duration (in milliseconds)
const DEFAULT_DURATION = 1000;

// Default zoom levels for different contexts
export const ZOOM_LEVELS = {
  WORLD: 1,
  CONTINENT: 3,
  COUNTRY: 5,
  CITY: 10,
  STREET: 15,
};

// Fly to specific coordinates with zoom
export const flyToLocation = (map, { longitude, latitude, zoom = ZOOM_LEVELS.COUNTRY, duration = DEFAULT_DURATION }) => {
  if (!map) {
    console.warn('Map instance not available for flyTo');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    map.flyTo({
      center: [longitude, latitude],
      zoom,
      duration,
      essential: true, // This animation is considered essential with respect to prefers-reduced-motion
    });

    // Resolve after animation completes
    setTimeout(resolve, duration + 100);
  });
};

// Ease to coordinates without changing zoom (for deep-linking)
export const easeToLocation = (map, { longitude, latitude, duration = DEFAULT_DURATION }) => {
  if (!map) {
    console.warn('Map instance not available for easeTo');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    map.easeTo({
      center: [longitude, latitude],
      duration,
      essential: true,
    });

    // Resolve after animation completes
    setTimeout(resolve, duration + 100);
  });
};

// Get current map bounds
export const getMapBounds = (map) => {
  if (!map) return null;
  
  const bounds = map.getBounds();
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
};

// Check if coordinates are currently visible in viewport
export const isLocationVisible = (map, longitude, latitude) => {
  if (!map) return false;
  
  const bounds = getMapBounds(map);
  if (!bounds) return false;
  
  return (
    longitude >= bounds.west &&
    longitude <= bounds.east &&
    latitude >= bounds.south &&
    latitude <= bounds.north
  );
};

// Get optimal zoom level based on distance from current position
export const getOptimalZoom = (currentZoom, targetDistance) => {
  // Simple heuristic: closer pins get higher zoom
  if (targetDistance < 1000) return Math.max(currentZoom, ZOOM_LEVELS.CITY);
  if (targetDistance < 10000) return Math.max(currentZoom, ZOOM_LEVELS.COUNTRY);
  if (targetDistance < 100000) return Math.max(currentZoom, ZOOM_LEVELS.CONTINENT);
  return ZOOM_LEVELS.WORLD;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Set mobile padding for better globe positioning
export const setMobilePadding = (map, isMobile) => {
  if (!map) return;
  const mobile = typeof isMobile === 'boolean'
    ? isMobile
    : (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  map.setPadding({ bottom: mobile ? 100 : 0 });
};

// Handle window resize and update padding
export const handleResize = (map, isMobile) => {
  if (!map || typeof map.resize !== 'function') return;

  const target = map;
  setTimeout(() => {
    try {
      // Guard against map being removed between scheduling and execution
      if (!target || typeof target.getContainer !== 'function') return;
      const container = target.getContainer();
      if (!container) return;
      target.resize();
      setMobilePadding(target, isMobile);
    } catch {}
  }, 100);
};
