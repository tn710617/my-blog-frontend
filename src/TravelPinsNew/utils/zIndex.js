// Z-index hierarchy for Travel Pins New implementation
// Lower values appear behind higher values

export const Z_INDEX = {
  // Base map layer
  MAP: 0,
  
  // Map markers and overlays
  MARKERS: 100,
  MARKER_HOVER: 110,
  
  // Popups (display windows)
  POPUP: 200,
  
  // Background overlay (modal backdrop)
  OVERLAY: 900,
  
  // Modals (forms, confirmations, photo viewer)
  MODAL: 1000,
  
  // Mobile gesture notifications/warnings
  GESTURE_WARNING: 1100,
  
  // Highest priority elements (toast notifications, etc.)
  TOAST: 2000,
};

// Helper function to get z-index value
export const getZIndex = (layer) => Z_INDEX[layer] || 0;

// Helper function to get inline style with z-index
export const withZIndex = (layer, additionalStyles = {}) => ({
  zIndex: getZIndex(layer),
  ...additionalStyles,
});