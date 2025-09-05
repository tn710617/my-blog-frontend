// Data models and validation for Travel Pins New
// Defines the pin data structure and validation helpers

// Pin data model (frontend format)
export const createEmptyPin = () => ({
  id: null,
  title: '',
  note: '',
  visited_at: null, // ISO string or null
  coordinates: [0, 0], // [longitude, latitude]
  photo_url: null,
  created_at: null,
  updated_at: null,
});

// Create pin from coordinates (for new pin creation)
export const createPinFromCoordinates = (longitude, latitude, defaults = {}) => ({
  ...createEmptyPin(),
  coordinates: [longitude, latitude],
  visited_at: new Date().toISOString().split('T')[0], // Default to today's date
  ...defaults,
});

// Validation helpers
export const validatePin = (pin) => {
  const errors = {};
  
  // Title is required
  if (!pin.title?.trim()) {
    errors.title = 'Title is required';
  } else if (pin.title.trim().length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }
  
  // Coordinates validation
  if (!pin.coordinates || !Array.isArray(pin.coordinates) || pin.coordinates.length !== 2) {
    errors.coordinates = 'Valid coordinates are required';
  } else {
    const [lng, lat] = pin.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      errors.coordinates = 'Coordinates must be numbers';
    } else if (lng < -180 || lng > 180) {
      errors.coordinates = 'Longitude must be between -180 and 180';
    } else if (lat < -90 || lat > 90) {
      errors.coordinates = 'Latitude must be between -90 and 90';
    }
  }
  
  // Photo URL validation (if provided)
  if (pin.photo_url && pin.photo_url.trim()) {
    try {
      new URL(pin.photo_url);
    } catch {
      errors.photo_url = 'Invalid photo URL';
    }
  }
  
  // Note length validation
  if (pin.note && pin.note.length > 5000) {
    errors.note = 'Note must be less than 5000 characters';
  }
  
  // Date validation (if provided)
  if (pin.visited_at) {
    const date = new Date(pin.visited_at);
    if (isNaN(date.getTime())) {
      errors.visited_at = 'Invalid date format';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Check if pin has unsaved changes (for edit confirmation)
export const hasUnsavedChanges = (originalPin, currentPin) => {
  if (!originalPin || !currentPin) return false;
  
  const fieldsToCompare = ['title', 'note', 'visited_at', 'photo_url'];
  
  return fieldsToCompare.some(field => {
    const original = originalPin[field] || '';
    const current = currentPin[field] || '';
    return original !== current;
  }) || (
    // Also check coordinates
    JSON.stringify(originalPin.coordinates || []) !== 
    JSON.stringify(currentPin.coordinates || [])
  );
};

// Generate display-friendly pin summary for delete confirmation
export const getPinSummary = (pin) => {
  if (!pin) return 'Unknown pin';
  
  const parts = [pin.title];
  
  if (pin.visited_at) {
    const date = new Date(pin.visited_at);
    if (!isNaN(date.getTime())) {
      parts.push(`visited ${date.toLocaleDateString()}`);
    }
  }
  
  if (pin.coordinates && Array.isArray(pin.coordinates)) {
    const [lng, lat] = pin.coordinates;
    parts.push(`at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }
  
  return parts.join(' ');
};