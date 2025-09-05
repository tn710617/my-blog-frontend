import React from 'react';
import { useIntl } from 'react-intl';
import { useMapStore } from '../stores/mapStore';
import { Z_INDEX } from '../utils/zIndex';

const MobileGestureToggle = () => {
  const intl = useIntl();
  const { isMobileGestureMode, toggleMobileGestureMode } = useMapStore();

  // Only show on mobile devices
  if (window.innerWidth > 768) {
    return null;
  }

  const isRotateMode = isMobileGestureMode === 'rotate';

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200"
      style={{ zIndex: Z_INDEX.GESTURE_WARNING }}
    >
      <button
        onClick={toggleMobileGestureMode}
        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-50 rounded-lg"
        title={intl.formatMessage({
          id: isRotateMode ? 'travel_pins.mobile_toggle.rotation_mode' : 'travel_pins.mobile_toggle.scroll_mode'
        })}
      >
        {/* Icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          {isRotateMode ? (
            // Rotate icon (globe/rotate)
            <svg 
              className="w-5 h-5 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21.426 11.095l-17-17A.999.999 0 003.74 5.005L8.999 10.3l3.975-3.976c.374-.373.972-.392 1.35-.035l8.008 7.535c.202.19.312.456.302.734a1 1 0 01-.908.925l-15.5 1.5a.999.999 0 01-.966-1.484l9.017-9.017-3.975 3.976c-.39.39-.39 1.024 0 1.414s1.024.39 1.414 0L21.426 11.095z" 
              />
            </svg>
          ) : (
            // Scroll icon
            <svg 
              className="w-5 h-5 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 7l4-4m0 0l4 4m-4-4v18" 
              />
            </svg>
          )}
        </div>

        {/* Label */}
        <span className={`text-sm font-medium ${isRotateMode ? 'text-blue-600' : 'text-green-600'}`}>
          {intl.formatMessage({
            id: isRotateMode ? 'travel_pins.mobile_toggle.rotation_mode' : 'travel_pins.mobile_toggle.scroll_mode'
          })}
        </span>

        {/* Status indicator */}
        <div 
          className={`w-2 h-2 rounded-full ${isRotateMode ? 'bg-blue-600' : 'bg-green-600'}`}
        />
      </button>
    </div>
  );
};

export default MobileGestureToggle;