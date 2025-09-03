/**
 * Z-Index Management for Travel Pins Page
 * 
 * This file centralizes all z-index values used in the Travel Pins feature
 * to prevent layering conflicts and improve maintainability.
 * 
 * Z-Index Hierarchy (from lowest to highest):
 * 1. Map markers (pins) - Should be below all UI elements
 * 2. Mapbox built-in controls and notifications
 * 3. Custom UI overlays (buttons, toasts)
 * 4. Form modals and popups
 * 5. Critical system modals (confirmation dialogs)
 */

export const Z_INDEX = {
  // Map Elements (Lowest - 0-10)
  MAP_MARKER_DEFAULT: 0,        // Default pin markers
  MAP_MARKER_HOVER: 1,          // Hovered pin markers
  
  // Mapbox Built-in Elements (10-100)
  // Note: Mapbox controls typically use z-index values in this range
  // Our custom elements should avoid this range
  
  // App UI Elements (100-500)
  GPS_BUTTON: 100,              // GPS location button
  LOCATION_ERROR_TOAST: 110,    // Location error toast
  LOADING_INDICATOR: 120,       // Loading/error indicators
  
  // Interactive Overlays (500-900)
  POPUP_BACKGROUND: 500,        // Background overlay for popups
  PIN_POPUP: 550,               // Pin display popups
  
  // Form and Modal System (900-9999)
  FORM_MODAL: 900,              // Pin creation/edit form
  DELETE_MODAL: 910,            // Delete confirmation modal
  ESC_MODAL: 920,               // Unsaved changes confirmation
  PHOTO_LIGHTBOX: 930,          // Photo viewing lightbox
  
  // Critical System Elements (9999+)
  CRITICAL_MODAL: 9999,         // For critical system messages
};

/**
 * Helper function to get z-index value with optional offset
 * @param {string} key - The z-index key
 * @param {number} offset - Optional offset to add to the base value
 * @returns {number} The z-index value
 */
export const getZIndex = (key, offset = 0) => {
  if (!(key in Z_INDEX)) {
    console.warn(`Z-Index key "${key}" not found. Available keys:`, Object.keys(Z_INDEX));
    return 1;
  }
  return Z_INDEX[key] + offset;
};

/**
 * CSS z-index values as strings (commonly used in style attributes)
 */
export const Z_INDEX_CSS = Object.fromEntries(
  Object.entries(Z_INDEX).map(([key, value]) => [key, value.toString()])
);

/**
 * Tailwind CSS z-index classes mapping
 * Note: Tailwind has limited z-index classes, use style attribute for custom values
 */
export const Z_INDEX_TAILWIND = {
  MAP_MARKER_DEFAULT: 'z-0',
  MAP_MARKER_HOVER: 'z-10',
  GPS_BUTTON: 'z-40',           // Custom value needs style attribute
  POPUP_BACKGROUND: 'z-40',     // Custom value needs style attribute  
  FORM_MODAL: 'z-50',
  CRITICAL_MODAL: 'z-50',       // Tailwind max is z-50
};

export default Z_INDEX;