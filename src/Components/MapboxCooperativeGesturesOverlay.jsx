import React, { useState, useEffect } from 'react';

const MapboxCooperativeGesturesOverlay = ({ 
  show = true, 
  onDismiss,
  isMobile = false,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    // Detect macOS for showing Cmd vs Ctrl
    setIsMacOS(navigator.platform.indexOf('Mac') > -1);
  }, []);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible) {
      // Auto-dismiss after 3 seconds (like real Mapbox behavior)
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  const getMessage = () => {
    if (isMobile) {
      return "Use two fingers to move the map";
    } else {
      return isMacOS 
        ? "Use ⌘ + scroll to zoom the map"
        : "Use Ctrl + scroll to zoom the map";
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Mapbox-style message: white text centered on the full-screen overlay */}
      <div className="text-white px-6 py-4 text-base font-medium max-w-sm text-center">
        {getMessage()}
      </div>
    </div>
  );
};

export default MapboxCooperativeGesturesOverlay;
