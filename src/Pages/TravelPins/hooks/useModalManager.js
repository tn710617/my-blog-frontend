import { useState } from 'react';

/**
 * Hook to manage various modal states and actions
 * @returns {Object} Modal states and handlers
 */
export const useModalManager = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEscModal, setShowEscModal] = useState(false);
  const [pendingDeletePin, setPendingDeletePin] = useState(null);
  const [pendingEscAction, setPendingEscAction] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalData, setPhotoModalData] = useState({ url: '', title: '' });
  const [coordsCopied, setCoordsCopied] = useState(false);

  // Delete modal handlers
  const openDeleteModal = (pin) => {
    setPendingDeletePin(pin);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPendingDeletePin(null);
  };

  // ESC confirmation modal handlers
  const openEscModal = (action) => {
    setPendingEscAction(() => action);
    setShowEscModal(true);
  };

  const closeEscModal = () => {
    setShowEscModal(false);
    setPendingEscAction(null);
  };

  const confirmEscAction = () => {
    if (pendingEscAction) {
      pendingEscAction();
    }
    closeEscModal();
  };

  // Photo modal handlers
  const openPhotoModal = (photoUrl, photoTitle) => {
    setPhotoModalData({ url: photoUrl, title: photoTitle });
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoModalData({ url: '', title: '' });
  };

  return {
    // States
    showDeleteModal,
    showEscModal,
    pendingDeletePin,
    showPhotoModal,
    photoModalData,
    coordsCopied,
    setCoordsCopied,
    
    // Handlers
    openDeleteModal,
    closeDeleteModal,
    openEscModal,
    closeEscModal,
    confirmEscAction,
    openPhotoModal,
    closePhotoModal
  };
};