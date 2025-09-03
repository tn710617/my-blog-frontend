import mapboxgl from 'mapbox-gl';
import { buildPopupHTML } from '../popupHtml';

/**
 * Creates an enhanced popup for a travel pin
 * @param {Object} pin - The travel pin data
 * @param {Object} options - Configuration options
 * @param {Function} options.t - Translation function
 * @param {Function} options.formatDate - Date formatting function
 * @param {boolean} options.isMobile - Whether the device is mobile
 * @param {boolean} options.isLoggedIn - Whether the user is logged in
 * @param {Function} options.renderMarkdownToHTML - Markdown rendering function
 * @param {Function} options.handlePopupOpen - Handler for popup open event
 * @param {Function} options.handlePopupClose - Handler for popup close event
 * @param {Function} options.applyAuthButtonsVisibility - Function to apply auth button visibility
 * @param {Function} options.handleDeletePin - Handler for delete pin action
 * @param {Function} options.handleEditPin - Handler for edit pin action
 * @param {Function} options.handleCopyCoordinates - Handler for copy coordinates action
 * @param {Function} options.openPhotoModal - Handler for opening photo modal
 * @param {Function} options.getCurrentPinData - Function to get current pin data by ID
 * @returns {mapboxgl.Popup} The created popup
 */
export const createEnhancedPopup = (pin, options) => {
  const {
    t,
    formatDate,
    isMobile,
    isLoggedIn,
    renderMarkdownToHTML,
    handlePopupOpen,
    handlePopupClose,
    applyAuthButtonsVisibility,
    handleDeletePin,
    handleEditPin,
    handleCopyCoordinates,
    openPhotoModal,
    getCurrentPinData
  } = options;

  const popupId = `popup-${pin.id}`;
  
  // Fixed center positioning for all devices
  const popupConfig = {
    closeButton: false,
    closeOnClick: false,
    className: 'travel-pin-popup travel-pin-popup-center',
    anchor: 'center',
    offset: [0, 0],
    maxWidth: 'none'
  };
  
  const popup = new mapboxgl.Popup(popupConfig).setHTML(
    buildPopupHTML(pin, { t, formatDate, isMobile, isLoggedIn, popupId, renderMarkdownToHTML })
  );
  
  // Add event listeners to track popup state
  popup.on('open', () => {
    handlePopupOpen(pin.id);

    // Improve mobile scrollability: stop events from reaching the map
    // and ensure the popup scroll container has momentum scrolling.
    try {
      const container = document.getElementById(popupId);
      
      if (container) {
        // Apply auth button visibility with current auth state
        applyAuthButtonsVisibility(container);
        // Delegate click handling to the container to avoid timing issues
        try {
          const onContainerClick = (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl || !container.contains(actionEl)) return;
            e.stopPropagation();
            const action = actionEl.getAttribute('data-action');
            switch (action) {
              case 'delete':
                handleDeletePin(pin);
                break;
              case 'edit':
                // Find the current pin data instead of using potentially stale closure data
                const currentPin = getCurrentPinData(pin.id);
                handleEditPin(currentPin || pin);
                break;
              case 'copy':
                handleCopyCoordinates(pin.coordinates, pin.id);
                break;
              case 'open-photo':
                if (pin.photo_url) openPhotoModal(pin.photo_url, pin.title);
                break;
              case 'close':
                try { popup.remove(); } catch {}
                break;
              default:
                break;
            }
          };
          // Save handler reference for cleanup
          container.__tp_onClick = onContainerClick;
          container.addEventListener('click', onContainerClick);
        } catch {}
      }
      // Apply auth visibility again in next tick to handle browser rendering delays
      setTimeout(() => {
        const el = document.getElementById(popupId);
        if (el) applyAuthButtonsVisibility(el);
      }, 0);
      
      const popupEl = container?.closest('.mapboxgl-popup');
      if (popupEl) {
        popupEl.style.webkitOverflowScrolling = 'touch';
        popupEl.style.overscrollBehavior = 'contain';
        popupEl.style.touchAction = 'pan-y';
      }

      if (container) {
        // Make the modal box itself scrollable with momentum on iOS
        container.style.maxHeight = '85vh';
        container.style.overflowY = 'auto';
        container.style.webkitOverflowScrolling = 'touch';
        container.style.overscrollBehavior = 'contain';
      }

    } catch (err) {
      // Silent error handling
    }
  });
  
  popup.on('close', () => {
    handlePopupClose(pin.id);
    
    // Cleanup delegated handler if present
    try {
      const container = document.getElementById(popupId);
      if (container && container.__tp_onClick) {
        container.removeEventListener('click', container.__tp_onClick);
        delete container.__tp_onClick;
      }
    } catch {}
  });
  
  return popup;
};