// URL utilities for Travel Pins New
// Handles deep-linking and URL generation

// Deep-link URL format: /travel-pins?pin=<id>
export const TRAVEL_PINS_PATH = '/travel-pins-new';

// Generate deep-link URL for a pin
export const generatePinUrl = (pinId, baseUrl = window.location.origin) => {
  if (!pinId) return null;
  
  const url = new URL(TRAVEL_PINS_PATH, baseUrl);
  url.searchParams.set('pin', pinId.toString());
  
  return url.href;
};

// Parse pin ID from current URL
export const getPinIdFromUrl = (searchParams = window.location.search) => {
  const params = new URLSearchParams(searchParams);
  const pinId = params.get('pin');
  
  if (!pinId) return null;
  
  // Validate pin ID (should be numeric or alphanumeric)
  if (!/^[a-zA-Z0-9_-]+$/.test(pinId)) {
    console.warn('Invalid pin ID format in URL:', pinId);
    return null;
  }
  
  return pinId;
};

// Update URL with pin parameter (for navigation without page reload)
export const updateUrlWithPin = (pinId) => {
  if (!pinId) {
    // Remove pin parameter
    const url = new URL(window.location);
    url.searchParams.delete('pin');
    window.history.replaceState({}, '', url.toString());
    return;
  }
  
  const url = new URL(window.location);
  url.searchParams.set('pin', pinId.toString());
  window.history.replaceState({}, '', url.toString());
};

// Remove pin parameter from URL
export const clearPinFromUrl = () => {
  updateUrlWithPin(null);
};

// Copy pin URL to clipboard with feedback
export const copyPinUrlToClipboard = async (pinId) => {
  try {
    const url = generatePinUrl(pinId);
    if (!url) {
      throw new Error('Invalid pin ID');
    }
    
    await navigator.clipboard.writeText(url);
    return { success: true, url };
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const url = generatePinUrl(pinId);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return { success: true, url };
    } catch (fallbackError) {
      return { 
        success: false, 
        error: 'Failed to copy URL. Please copy the URL manually.' 
      };
    }
  }
};

// Validate if current page is the travel pins page
export const isOnTravelPinsPage = (pathname = window.location.pathname) => {
  return pathname === TRAVEL_PINS_PATH || pathname.startsWith(`${TRAVEL_PINS_PATH}/`);
};