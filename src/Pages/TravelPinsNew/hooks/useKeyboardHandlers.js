import {useEffect, useRef} from 'react';
import {useModalStore} from '../stores/modalStore';
import {openDisplayPopup, closeDisplayPopup} from '../utils/displayPopupController';

// Centralized ESC handling for TravelPinsNew
// Capture at document level to avoid Mapbox/default handlers interfering.
export const useKeyboardHandlers = () => {
    useEffect(() => {
        const onKeyDownCapture = (e) => {
            if (e.key !== 'Escape') return;

            // Don't handle ESC if search box is focused (let search bar handle it)
            if (document.activeElement?.id === 'location-search-input') return;

            const store = useModalStore.getState();
            const {
                activeModal,
                modalData,
                deleteModal,
                photoModal,
                formModal,
                displayModal,
                closeModal,
                updateModalData,
            } = store;

            // Always handle ESC ourselves; block further handlers
            e.preventDefault();
            e.stopPropagation();

            // Priority: delete modal -> photo modal -> display popup
            if ([deleteModal, photoModal].includes(activeModal) && (modalData?.pin || modalData?.pinId)) {
                // Close delete modal and restore display popup
                closeModal();
                // Defer re-open to next tick to avoid same-event keyup side effects
                setTimeout(() => {
                    try {
                        openDisplayPopup(modalData?.pinId || modalData?.pin?.id);
                    } catch {
                    }
                }, 0);
                return;
            }

            if (activeModal === formModal) {
                // Avoid immediately closing form when just returned from esc-confirm
                const pin = modalData?.pin;
                const confirmOpen = !!modalData?.confirmOpen;
                const isDirty = !!modalData?.dirty;
                // If confirm dialog is open over form, ESC acts as cancel -> just close confirm
                if (confirmOpen) {
                    updateModalData({confirmOpen: false});
                    return;
                }
                if (isDirty) {
                    // Open confirm inline (keep form mounted)
                    updateModalData({confirmOpen: true});
                    return;
                }
                // Not dirty → close directly and restore display
                closeModal();
                if (pin) setTimeout(() => {
                    try {
                        openDisplayPopup(pin.id);
                    } catch {
                    }
                }, 0);
                return;
            }

            // No standalone esc-confirm modal anymore

            if (activeModal === displayModal) {
                // Close display popup and its overlay
                try {
                    closeDisplayPopup();
                } catch {
                }
                closeModal();
                return;
            }

            // Otherwise, ignore ESC (no global action)
        };

        document.addEventListener('keydown', onKeyDownCapture, true);
        return () => document.removeEventListener('keydown', onKeyDownCapture, true);
    }, []);
};
