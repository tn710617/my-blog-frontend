import { useEffect } from 'react';
import { useModalStore } from '../stores/modalStore';
import { openDisplayPopup, closeDisplayPopup } from '../utils/displayPopupController';

// Centralized ESC handling for TravelPinsNew
// Capture at document level to avoid Mapbox/default handlers interfering.
export const useKeyboardHandlers = () => {
  useEffect(() => {
    const onKeyDownCapture = (e) => {
      if (e.key !== 'Escape') return;
      const store = useModalStore.getState();
      const { activeModal, modalData, closeModal, openModal } = store;

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
        // Close photo modal then restore display popup
        closeModal();
        const pin = modalData?.pin;
        if (pin) {
          setTimeout(() => { try { openDisplayPopup(pin); } catch {} }, 0);
        }
        return;
      }

      if (activeModal === 'form') {
        const pin = modalData?.pin;
        const isDirty = !!modalData?.dirty;
        if (isDirty) {
          // Open confirm modal instead of closing directly
          const onConfirm = () => {
            // User confirms to discard changes → close esc-confirm and restore display popup
            const { closeModal: _close } = useModalStore.getState();
            _close(); // close esc-confirm
            if (pin) setTimeout(() => { try { openDisplayPopup(pin); } catch {} }, 0);
          };
          openModal('esc-confirm', { onConfirm, pin, draft: modalData?.draft });
          return;
        }
        // Not dirty → close directly and restore display
        closeModal();
        if (pin) setTimeout(() => { try { openDisplayPopup(pin); } catch {} }, 0);
        return;
      }

      if (activeModal === 'esc-confirm') {
        // ESC on confirm modal = cancel → back to edit form
        const pin = modalData?.pin;
        const draft = modalData?.draft;
        closeModal();
        if (pin) {
          try { openModal('form', { pin, draft }); } catch {}
        }
        return;
      }

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
