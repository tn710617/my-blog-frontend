import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import TravelPinsSearchBar from './TravelPinsSearchBar';

export default function TravelPinsMobileSearchModal({ isOpen, onClose, onLocationSelect }) {
  const intl = useIntl();
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to get translated text
  const t = (key) => intl.formatMessage({id: key});

  // Handle modal animation and scroll lock (same as edit modal)
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Simple body scroll lock like edit modal
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      // Delay removing from DOM to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    onLocationSelect(location);
    onClose();
  };

  // Don't render if not open and not animating
  if (!isOpen && !isAnimating) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[60] transition-all duration-300 flex justify-center overflow-y-auto p-4 ${
        isOpen 
          ? 'bg-black/50 backdrop-blur-sm' 
          : 'bg-transparent backdrop-blur-none'
      }`}
    >
      {/* Modal Content */}
      <div 
        className={`bg-white shadow-2xl transition-all duration-300 ease-out w-full max-w-md max-h-[85vh] my-4 self-start rounded-2xl flex flex-col overflow-visible ${
          isOpen 
            ? 'transform translate-y-0 scale-100' 
            : 'transform -translate-y-full scale-95'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Simple Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
            </svg>
            <span className="text-lg font-medium text-gray-700">Search Location</span>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar Container with space for dropdown */}
        <div className="p-4 flex-1 overflow-visible">
          <TravelPinsSearchBar 
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </div>
    </div>
  );
}