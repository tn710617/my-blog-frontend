import React from 'react';
import { useModalStore } from '../../stores/modalStore';
import { Z_INDEX } from '../../utils/zIndex';

const PhotoModal = () => {
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closePhotoAndBackToDisplay = useModalStore((s) => s.closePhotoAndBackToDisplay);

  if (activeModal !== 'photo' || !modalData?.url) return null;

  const { url, title } = modalData;

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: Z_INDEX.MODAL, pointerEvents: 'none'
    }}>
      <div style={{ position: 'relative', width: 'min(92vw, 980px)', pointerEvents: 'auto' }}>
        <button onClick={closePhotoAndBackToDisplay} aria-label="Close" style={{
          position: 'absolute', top: -12, right: -12, width: 36, height: 36,
          borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.08)', background: 'white', cursor: 'pointer',
          boxShadow: '0 6px 12px rgba(0,0,0,0.12)'
        }}>
          ✕
        </button>
        <img src={url} alt={title || 'photo'} style={{
          display: 'block', width: '100%', height: 'min(80vh, 720px)', objectFit: 'contain', borderRadius: 12,
          background: '#0b0f19'
        }} />
      </div>
    </div>
  );
};

export default PhotoModal;
