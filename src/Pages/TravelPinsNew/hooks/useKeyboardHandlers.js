import { useEffect, useRef } from 'react';
import { useModalStore } from '../stores/modalStore';
import { openDisplayPopup, closeDisplayPopup } from '../utils/displayPopupController';

// Centralized ESC handling for TravelPinsNew
// Capture at document level to avoid Mapbox/default handlers interfering.
export const useKeyboardHandlers = () => {
  const suppressFormEscUntilRef = useRef(0);
  useEffect(() => {
    const onKeyDownCapture = (e) => {
      if (e.key !== 'Escape') return;
      
      // Don't handle ESC if search box is focused (let search bar handle it)
      if (document.activeElement?.id === 'location-search-input') return;
      
      const store = useModalStore.getState();
      const { activeModal, modalData, closeModal, openModal, updateModalData } = store;

      // Always handle ESC ourselves; block further handlers
      e.preventDefault();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      e.stopPropagation();

      // Priority: delete modal -> photo modal -> display popup
      if (activeModal === 'delete' && modalData?.pin) {
        // Close delete modal and restore display popup
        closeModal();
        // Defer re-open to next tick to avoid same-event keyup side effects
        setTimeout(() => {
          try { openDisplayPopup(modalData.pin); } catch {}
        }, 0);
        return;
      }

      if (activeModal === 'photo') {
        // Unified behavior for ESC and close button
        try { useModalStore.getState().closePhotoAndBackToDisplay(); } catch {}
        return;
      }

      if (activeModal === 'form') {
        // Avoid immediately closing form when just returned from esc-confirm
        if (Date.now() < suppressFormEscUntilRef.current) {
          return;
        }
        const pin = modalData?.pin;
        const confirmOpen = !!modalData?.confirmOpen;
        const isDirty = !!modalData?.dirty;
        // If confirm dialog is open over form, ESC acts as cancel -> just close confirm
        if (confirmOpen) {
          updateModalData({ confirmOpen: false });
          return;
        }
        if (isDirty) {
          // Open confirm inline (keep form mounted)
          updateModalData({ confirmOpen: true });
          return;
        }
        // Not dirty → close directly and restore display
        closeModal();
        if (pin) setTimeout(() => { try { openDisplayPopup(pin); } catch {} }, 0);
        return;
      }

      // No standalone esc-confirm modal anymore

      if (activeModal === 'display') {
        // Close display popup and its overlay
        try { closeDisplayPopup(); } catch {}
        closeModal();
        return;
      }

      // Otherwise, ignore ESC (no global action)
    };

    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => document.removeEventListener('keydown', onKeyDownCapture, true);
  }, []);
};
