import mapboxgl from 'mapbox-gl';
// Use TravelPinsNew's own popup templates and styles (no cross-imports)
import { buildPopupHTML } from './popupHtml';
import { injectPopupStyles } from './popupStyles';
import { markdownToHtml } from './markdownUtils';

/**
 * Modern popup factory for Travel Pins New
 * Simplified design with clean interactions
 */

let stylesInjected = false;

/**
 * Create a modern popup for a travel pin
 * @param {Object} pin - Pin data
 * @param {Object} handlers - Event handlers
 * @returns {mapboxgl.Popup}
 */
export function createPopup(pin, handlers) {
  // Inject TravelPinsNew popup styles once
  if (!stylesInjected) {
    try { injectPopupStyles(); } catch {}
    stylesInjected = true;
  }

  const {
    t = (key) => key, // Fallback if no translation function
    formatDate = (date) => new Date(date).toLocaleDateString(),
    isLoggedIn = false,
    renderMarkdownToHTML = (text) => text,
    onPopupOpen,
    onPopupClose,
    onCopyLink,
    onEdit,
    onDelete,
    onPhotoView
  } = handlers;

  // Create popup with modern config
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'travel-pin-popup-container',
    anchor: 'center',
    offset: [0, 0],
    maxWidth: 'none'
  });

  const popupId = `popup-${pin.id}`;

  // Build HTML
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const html = buildPopupHTML(pin, {
    t,
    formatDate,
    isMobile,
    isLoggedIn,
    popupId,
    renderMarkdownToHTML: renderMarkdownToHTML || markdownToHtml
  });

  popup.setHTML(html);

  // Set up event handling
  popup.on('open', () => {
    setupPopupInteractions(popup, pin, handlers);
    if (onPopupOpen) onPopupOpen(pin.id, popup);
  });

  popup.on('close', () => {
    if (onPopupClose) onPopupClose(pin.id);
  });

  return popup;
}

/**
 * Set up popup interactions after it's opened
 */
function setupPopupInteractions(popup, pin, handlers) {
  const element = popup.getElement();
  if (!element) return;

  const {
    onCopyLink,
    onEdit,
    onDelete,
    onPhotoView
  } = handlers;

  // Single event listener with delegation
  element.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    const action = button.dataset.action;

    switch (action) {
      case 'close':
        popup.remove();
        break;
      
      case 'copy':
        if (onCopyLink) {
          onCopyLink(pin);
          showCopyFeedback(button);
        }
        break;
      
      case 'edit':
        if (onEdit) onEdit(pin);
        break;
      
      case 'delete':
        if (onDelete) onDelete(pin);
        break;
      
      case 'photo':
        if (onPhotoView) onPhotoView(pin);
        break;
    }
  });
}

/**
 * Show visual feedback for copy action
 */
function showCopyFeedback(button) {
  const originalText = button.innerHTML;
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
    Copied!
  `;
  button.style.background = '#10b981';
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = '';
  }, 2000);
}

/**
 * Update popup content without recreating
 * @param {mapboxgl.Popup} popup - Existing popup
 * @param {Object} pin - Updated pin data
 * @param {Object} handlers - Event handlers
 */
export function updatePopup(popup, pin, handlers) {
  if (!popup || !popup.isOpen()) return;

  const {
    t = (key) => key,
    formatDate = (date) => new Date(date).toLocaleDateString(),
    isLoggedIn = false,
    renderMarkdownToHTML = (text) => text
  } = handlers;

  const popupId = `popup-${pin.id}`;
  
  // Rebuild HTML
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const html = buildPopupHTML(pin, {
    t,
    formatDate,
    isMobile,
    isLoggedIn,
    popupId,
    renderMarkdownToHTML
  });

  popup.setHTML(html);
  setupPopupInteractions(popup, pin, handlers);
}

/**
 * Create popup for marker click
 * @param {Object} pin - Pin data
 * @param {Object} marker - Mapbox marker
 * @param {Object} handlers - Event handlers
 * @returns {mapboxgl.Popup}
 */
export function createAndOpenPopup(pin, marker, handlers) {
  const popup = createPopup(pin, handlers);
  popup.setLngLat(pin.coordinates).addTo(marker.getMap());
  return popup;
}
