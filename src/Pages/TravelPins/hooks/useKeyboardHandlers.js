import { useEffect } from 'react';

/**
 * Hook to manage keyboard event handlers (ESC key handling)
 */
export const useKeyboardHandlers = ({
  showForm,
  showDeleteModal,
  showEscModal,
  showPhotoModal,
  hasChanges,
  openPopups,
  handleCloseForm,
  openEscModal,
  cancelDeletePin,
  closePhotoModal,
  closeAllPopups,
  markersRef
}) => {
  // ESC key handler for form modal
  useEffect(() => {
    if (!showForm) return;

    const handleEscape = (e) => {
      // Don't handle ESC if search box is focused
      if (document.activeElement?.id === 'location-search-input') return;
      
      if (e.key === 'Escape') {
        if (!hasChanges) {
          // No changes made, close immediately
          handleCloseForm();
        } else {
          // Has changes, show confirmation dialog
          openEscModal(handleCloseForm);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showForm, hasChanges, handleCloseForm, openEscModal]);

  // ESC key handler for delete modal
  useEffect(() => {
    if (!showDeleteModal) return;

    const handleDeleteModalEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelDeletePin();
      }
    };

    document.addEventListener('keydown', handleDeleteModalEscape);
    return () => document.removeEventListener('keydown', handleDeleteModalEscape);
  }, [showDeleteModal, cancelDeletePin]);

  // ESC key handler for photo modal (highest priority)
  useEffect(() => {
    if (!showPhotoModal) return;

    const handlePhotoModalEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePhotoModal();
      }
    };

    // Add with capture=true for higher priority
    document.addEventListener('keydown', handlePhotoModalEscape, true);
    return () => document.removeEventListener('keydown', handlePhotoModalEscape, true);
  }, [showPhotoModal, closePhotoModal]);

  // ESC key handler for closing display popups (when form is not open)
  useEffect(() => {
    if (showForm || showDeleteModal || showEscModal || showPhotoModal) return; // Don't handle ESC when modals are open

    const handleEscapeForPopups = (e) => {
      if (e.key === 'Escape') {
        // Double-check modal states to prevent conflicts
        if (showPhotoModal || showForm || showDeleteModal || showEscModal) {
          return; // Exit early if any modal is open
        }
        
        if (openPopups.size > 0) {
          // Close all open popups
          markersRef.current.forEach(marker => {
            if (marker.getPopup() && marker.getPopup().isOpen()) {
              marker.getPopup().remove();
            }
          });
          closeAllPopups();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeForPopups);
    return () => document.removeEventListener('keydown', handleEscapeForPopups);
  }, [showForm, showDeleteModal, showEscModal, showPhotoModal, openPopups, markersRef, closeAllPopups]);
};