import React, { useEffect } from 'react';
import { useModalStore } from '../stores/modalStore';
import { useMapStore } from '../stores/mapStore';
import { closeDisplayPopup, openDisplayPopup } from '../utils/displayPopupController';
import { Z_INDEX } from '../utils/zIndex';
import DisplayPopup from './Popups/DisplayPopup';
import DeleteConfirmationModal from './Modals/DeleteConfirmationModal';
import PhotoModal from './Modals/PhotoModal';
import EditPinModal from './Modals/EditPinModal';
import EscConfirmModal from './Modals/EscConfirmModal';

// Unified Overlay Root: single backdrop + scroll container
const OverlayRoot = () => {
  const hasAnyModalOpen = useModalStore((s) => s.hasAnyModalOpen());
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateModalData = useModalStore((s) => s.updateModalData);

  const mapInstance = useMapStore((s) => s.mapInstance);

  const handleBackdropClick = () => {
    // Unify overlay click behavior (kept from previous logic)
    if (activeModal === 'delete' && (modalData?.pin || modalData?.pinId)) {
      closeModal();
      setTimeout(() => { try { openDisplayPopup(modalData?.pinId || modalData?.pin?.id); } catch {} }, 0);
      return;
    }
    if (activeModal === 'form' && modalData?.confirmOpen) {
      updateModalData({ confirmOpen: false });
      return;
    }
    if (activeModal === 'photo') {
      closeModal();
      return;
    }
    // default (includes 'display')
    closeDisplayPopup();
    closeModal();
  };

  // Scroll lock + disable map interactions while any modal is open
  useEffect(() => {
    if (!hasAnyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const m = mapInstance;
    const restore = [];
    try {
      if (m?.keyboard?.isEnabled && m.keyboard.isEnabled()) { m.keyboard.disable(); restore.push(() => m.keyboard.enable()); }
      if (m?.dragPan?.isEnabled && m.dragPan.isEnabled()) { m.dragPan.disable(); restore.push(() => m.dragPan.enable()); }
      if (m?.scrollZoom?.isEnabled && m.scrollZoom.isEnabled()) { m.scrollZoom.disable(); restore.push(() => m.scrollZoom.enable()); }
      if (m?.boxZoom?.isEnabled && m.boxZoom.isEnabled()) { m.boxZoom.disable(); restore.push(() => m.boxZoom.enable()); }
      if (m?.doubleClickZoom?.isEnabled && m.doubleClickZoom.isEnabled()) { m.doubleClickZoom.disable(); restore.push(() => m.doubleClickZoom.enable()); }
      if (m?.touchZoomRotate?.isEnabled && m.touchZoomRotate.isEnabled()) { m.touchZoomRotate.disable(); restore.push(() => m.touchZoomRotate.enable()); }
      if (m?.dragRotate?.isEnabled && m.dragRotate.isEnabled()) { m.dragRotate.disable(); restore.push(() => m.dragRotate.enable()); }
    } catch {}
    return () => {
      document.body.style.overflow = prevOverflow;
      try { restore.reverse().forEach((fn) => fn && fn()); } catch {}
    };
  }, [hasAnyModalOpen, mapInstance]);

  if (!hasAnyModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.OVERLAY }}>
      {/* Backdrop (shared) */}
      <div
        role="presentation"
        onClick={handleBackdropClick}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)'
        }}
      />

      {/* Scroll container and content surface (shared) */}
      <div className="fixed inset-0 flex justify-center p-4 overflow-y-auto" style={{ pointerEvents: 'none' }}>
        {/* Each child enables pointer events to remain interactive */}
        {activeModal === 'display' && (
          <div className="my-4 self-start" style={{ zIndex: Z_INDEX.POPUP, pointerEvents: 'auto' }}>
            <DisplayPopup withinOverlay />
          </div>
        )}
        {activeModal === 'delete' && (
          <div className="my-4 self-start" style={{ zIndex: Z_INDEX.MODAL, pointerEvents: 'auto' }}>
            <DeleteConfirmationModal withinOverlay />
          </div>
        )}
        {activeModal === 'form' && !modalData?.confirmOpen && (
          <div className="my-4 self-start" style={{ zIndex: Z_INDEX.MODAL, pointerEvents: 'auto' }}>
            <EditPinModal withinOverlay />
          </div>
        )}
        {activeModal === 'form' && modalData?.confirmOpen && (
          <div className="my-4 self-start" style={{ zIndex: Z_INDEX.MODAL, pointerEvents: 'auto' }}>
            <EscConfirmModal withinOverlay />
          </div>
        )}
        {activeModal === 'photo' && (
          <div className="my-4 self-center w-full" style={{ zIndex: Z_INDEX.MODAL, pointerEvents: 'auto' }}>
            <PhotoModal withinOverlay />
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayRoot;

