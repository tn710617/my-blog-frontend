import { create } from 'zustand';

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
