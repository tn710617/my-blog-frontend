import { create } from 'zustand';
import { openDisplayPopup } from '../utils/displayPopupController';

/**
 * Modal type constants - single source of truth
 */
export const MODAL_TYPES = {
  DELETE: 'delete',
  PHOTO: 'photo',
  FORM: 'form',
  DISPLAY: 'display',
  ESC_CONFIRM: 'esc-confirm'
} as const;

/**
 * Modal types supported by the overlay system
 */
export type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES] | null;

/**
 * Minimal Pin shape used by modals
 */
export interface Pin {
  id: string | number;
  title?: string;
  description?: string;
}

/**
 * Data carried by the active modal
 */
export interface ModalData {
  pin?: Pin;
  pinId?: string | number;
}

/**
 * Modal store interface combining state and actions
 */
export interface ModalStore {
  // State
  activeModal: ModalType;
  modalData: ModalData | null;

  // Actions
  openModal: (modalType: ModalType, data?: ModalData | null) => void;
  closeModal: () => void;
  closePhotoAndBackToDisplay: () => void;
  updateModalData: (updates: Partial<ModalData>) => void;
  isModalOpen: (modalType: ModalType) => boolean;
  hasAnyModalOpen: () => boolean;
  getCurrentModalData: () => ModalData | null;
}

/**
 * Modal state management for Travel Pins New
 * Handles which modal is currently open and prevents multiple modals from being open simultaneously
 */
export const useModalStore = create<ModalStore>((set, get) => ({
  // State
  activeModal: null,
  modalData: null,

  // Actions
  openModal: (modalType: ModalType, data: ModalData | null = null) => {
    set({
      activeModal: modalType,
      modalData: data,
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalData: null,
    });
  },

  closePhotoAndBackToDisplay: () => {
    const { activeModal, modalData} = get();
    if (activeModal !== MODAL_TYPES.PHOTO) return;

    const pinId = modalData?.pinId ?? modalData?.pin?.id;
    set({ activeModal: null, modalData: null });

    if (pinId != null) {
      // Defer to next tick to avoid interfering with current event stack
      setTimeout(() => {
        try {
          openDisplayPopup(pinId);
        } catch {
          // Silently handle errors
        }
      }, 0);
    }
  },

  updateModalData: (updates: Partial<ModalData>) => {
    const current = get().modalData;
    if (current) {
      set({ modalData: { ...current, ...updates } });
    } else {
      set({ modalData: updates as ModalData });
    }
  },

  isModalOpen: (modalType: ModalType) => {
    return get().activeModal === modalType;
  },

  hasAnyModalOpen: () => {
    return get().activeModal !== null;
  },

  getCurrentModalData: () => {
    return get().modalData;
  },
}));
