import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useModalStore } from '../stores/modalStore';
import { useMapStore } from '../stores/mapStore';
import { closeDisplayPopup } from '../utils/displayPopupController';
import { Z_INDEX } from '../utils/zIndex';

const BackgroundOverlay = () => {
  const hasAnyModalOpen = useModalStore((s) => s.hasAnyModalOpen());
  const closeModal = useModalStore((s) => s.closeModal);
  const mapRootEl = useMapStore((s) => s.mapRootEl);

  const handleClose = () => {
    closeDisplayPopup();
    closeModal();
  };

  useEffect(() => {
    if (!hasAnyModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hasAnyModalOpen]);

  if (!hasAnyModalOpen || !mapRootEl) return null;

  const overlay = (
    <div
      role="presentation"
      onClick={handleClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: Z_INDEX.OVERLAY,
        // 重新啟用模糊，但因為 overlay 在 map 容器 stacking context，
        // 且 popup 的 z-index 更高，不會模糊到 popup 本身。
        backdropFilter: 'blur(2px) saturate(80%)',
        WebkitBackdropFilter: 'blur(2px) saturate(80%)',
      }}
    />
  );

  return ReactDOM.createPortal(overlay, mapRootEl);
};

export default BackgroundOverlay;
