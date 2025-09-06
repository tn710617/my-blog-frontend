import { create } from 'zustand';
import { openDisplayPopup } from '../utils/displayPopupController';

// Modal state management for Travel Pins New
// Handles which modal is currently open and prevents multiple modals from being open simultaneously
export const useModalStore = create((set, get) => ({
  // Currently open modal type
  activeModal: null, // 'display' | 'form' | 'delete' | 'photo' | 'esc-confirm' | null
  
  // Modal-specific data
  modalData: null,
  
  // Open a modal
  openModal: (modalType, data = null) => {
    set({
      activeModal: modalType,
      modalData: data
    });
  },
  
  // Close the current modal
  closeModal: () => {
    set({
      activeModal: null,
      modalData: null
    });
  },

  // Close photo modal and return to display popup (unified handler for ESC/close button)
  closePhotoAndBackToDisplay: () => {
    const { activeModal, modalData } = get();
    if (activeModal !== 'photo') return;
    const pinId = modalData?.pinId || modalData?.pin?.id;
    set({ activeModal: null, modalData: null });
    if (pinId) {
      // Defer to next tick to avoid interfering with current event stack
      setTimeout(() => { try { openDisplayPopup(pinId); } catch {} }, 0);
    }
  },
  
  // Update current modal data (non-destructive)
  updateModalData: (updates) => {
    const current = get().modalData || {};
    set({ modalData: { ...current, ...updates } });
  },
  
  // Check if a specific modal is open
  isModalOpen: (modalType) => {
    return get().activeModal === modalType;
  },
  
  // Check if any modal is open (for background overlay)
  hasAnyModalOpen: () => {
    return get().activeModal !== null;
  },
  
  // Get current modal data
  getCurrentModalData: () => {
    return get().modalData;
  }
}));
