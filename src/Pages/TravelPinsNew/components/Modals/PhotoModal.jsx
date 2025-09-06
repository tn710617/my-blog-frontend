import React from 'react';
import { useModalStore } from '../../stores/modalStore';

const PhotoModal = ({ withinOverlay = false }) => {
  const activeModal = useModalStore((s) => s.activeModal);
  const modalData = useModalStore((s) => s.modalData);
  const closePhotoAndBackToDisplay = useModalStore((s) => s.closePhotoAndBackToDisplay);

  if (activeModal !== 'photo' || !modalData?.url) return null;

  const { url, title } = modalData;

  const content = (
    <div className="relative w-full h-[calc(100vh-2rem)] flex items-center justify-center">
      <img
        src={url}
        alt={title || 'photo'}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        style={{ maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}
      />
      <button
        onClick={closePhotoAndBackToDisplay}
        className="absolute top-4 right-4 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors duration-200 backdrop-blur-sm border border-white/20"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      {title && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-xl inline-block backdrop-blur-sm border border-white/20 max-w-md">
            <div className="font-medium">{title}</div>
          </div>
        </div>
      )}
    </div>
  );

  if (withinOverlay) return content;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
      role="dialog" 
      aria-modal="true"
    >
      {content}
    </div>
  );
};

export default PhotoModal;
