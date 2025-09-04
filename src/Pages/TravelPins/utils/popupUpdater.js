/**
 * Utility for updating popup content when pin data changes
 */
import { buildPopupHTML } from '../popupHtml';
import { handleCopyCoordinates } from './coordinateUtils';

/**
 * Updates the content of open popups when pin data changes
 */
export const updateOpenPopupContent = ({
  pins,
  map,
  mapLoaded,
  markersByIdRef,
  t,
  formatDate,
  isMobile,
  isLoggedIn,
  renderMarkdownToHTML,
  applyAuthButtonsVisibility,
  handleDeletePin,
  handleEditPin,
  openPhotoModal,
  setCoordsCopied
}) => {
  if (!map || !mapLoaded || !pins.length) return;

  // Update popup content for existing markers when pin data changes
  pins.forEach(pin => {
    const marker = markersByIdRef.current.get(pin.id);
    if (!marker) return;

    const popup = marker.getPopup();
    if (!popup || !popup.isOpen || !popup.isOpen()) return;

    // Get the popup container and update its content directly
    const popupElement = popup.getElement();
    if (!popupElement) return;

    // Find the content container and update it
    const contentContainer = popupElement.querySelector(`#popup-${pin.id}`);
    if (!contentContainer) return;

    // Clean up old event handlers first
    if (contentContainer.__tp_onClick) {
      contentContainer.removeEventListener('click', contentContainer.__tp_onClick);
      delete contentContainer.__tp_onClick;
    }
    
    // Update the content without recreating the entire popup
    const htmlMatch = buildPopupHTML(pin, { 
      t, 
      formatDate, 
      isMobile, 
      isLoggedIn, 
      popupId: `popup-${pin.id}`, 
      renderMarkdownToHTML 
    }).match(/<div[^>]*id="popup-[^"]*"[^>]*>([\s\S]*)<\/div>/);
    
    if (htmlMatch) {
      contentContainer.innerHTML = htmlMatch[1];
    }
    
    // Reapply auth button visibility
    applyAuthButtonsVisibility(contentContainer);
    
    // Re-attach event handlers with current pin data
    const onContainerClick = (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl || !contentContainer.contains(actionEl)) return;
      e.stopPropagation();
      const action = actionEl.getAttribute('data-action');
      switch (action) {
        case 'delete':
          handleDeletePin(pin);
          break;
        case 'edit':
          // Use current pin data from pins array
          const currentPin = pins.find(p => p.id === pin.id);
          handleEditPin(currentPin || pin);
          break;
        case 'copy':
          handleCopyCoordinates(pin.coordinates, pin.id, t, setCoordsCopied);
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
    
    // Save handler reference for cleanup and attach it
    contentContainer.__tp_onClick = onContainerClick;
    contentContainer.addEventListener('click', onContainerClick);
  });
};