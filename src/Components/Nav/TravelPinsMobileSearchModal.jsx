import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import TravelPinsSearchBar from './TravelPinsSearchBar';

export default function TravelPinsMobileSearchModal({ isOpen, onClose, onLocationSelect }) {
  const intl = useIntl();
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to get translated text
  const t = (key) => intl.formatMessage({id: key});

  // Handle modal animation and scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent body scroll and maintain position
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
        top: -${scrollY}px;
        left: 0;
        right: 0;
      `;
    } else {
      // Get the scroll position from body style
      const scrollY = document.body.style.top;
      // Restore body scroll
      document.body.style.cssText = '';
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
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

  // Prevent scroll propagation within modal
  const handleModalScroll = (e) => {
    e.stopPropagation();
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
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        isOpen 
          ? 'bg-black/50 backdrop-blur-sm' 
          : 'bg-transparent backdrop-blur-none'
      }`}
    >
      {/* Modal Content */}
      <div 
        onScroll={handleModalScroll}
        className={`absolute top-0 left-0 right-0 bg-white shadow-2xl transition-all duration-300 ease-out max-h-screen overflow-y-auto ${
          isOpen 
            ? 'transform translate-y-0' 
            : 'transform -translate-y-full'
        }`}
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

        {/* Search Bar */}
        <div className="p-4">
          <TravelPinsSearchBar 
            onLocationSelect={handleLocationSelect}
          />
        </div>

      </div>
    </div>
  );
}