import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useModalStore } from '../stores/modalStore';
import { useMapStore } from '../stores/mapStore';
import { closeDisplayPopup, openDisplayPopup } from '../utils/displayPopupController';
import { Z_INDEX } from '../utils';

const BackgroundOverlay = () => {
  const hasAnyModalOpen = useModalStore((s) => s.hasAnyModalOpen());
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closeModal = useModalStore((s) => s.closeModal);
  const updateModalData = useModalStore((s) => s.updateModalData);
  const mapRootEl = useMapStore((s) => s.mapRootEl);
  const mapInstance = useMapStore((s) => s.mapInstance);

  const handleClose = () => {
    // delete：ESC/點 overlay 視同取消 → 關閉 modal、回到 display popup
    if (activeModal === 'delete' && modalData?.pin) {
      closeModal();
      // 避免同一次鍵盤事件（尤其 keyup）關掉剛重開的 popup，延後至下一輪事件循環
      setTimeout(() => { try { openDisplayPopup(modalData.pin); } catch {} }, 0);
      return;
    }
    // form + confirmOpen：只關閉確認層，保留編輯表單
    if (activeModal === 'form' && modalData?.confirmOpen) {
      updateModalData({ confirmOpen: false });
      return;
    }
    // photo：ESC/點 overlay 僅關閉 photo modal，保留 display popup
    if (activeModal === 'photo') {
      closeModal();
      return;
    }
    // 其他（含 display）：關閉 popup + modal
    closeDisplayPopup();
    closeModal();
  };

  useEffect(() => {
    if (!hasAnyModalOpen) return;
    // scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Disable Mapbox interactions while overlay/modal open (keyboard + gestures)
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
