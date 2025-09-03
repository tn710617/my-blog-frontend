import React from 'react';
import { Z_INDEX } from '../utils/zIndex';

/**
 * Overlay controls component containing GPS locate button and location error toast
 * Displays floating controls over the map interface
 */
const OverlayControls = ({
  isLocating,
  locationError,
  onGetCurrentLocation,
  onClearLocationError
}) => {
  return (
    <>
      {/* GPS Location Button */}
      <button
        onClick={onGetCurrentLocation}
        disabled={isLocating}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isLocating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1'
        }`}
        style={{ zIndex: Z_INDEX.GPS_BUTTON }}
        title={isLocating ? 'Getting location...' : 'Get current location'}
      >
        {isLocating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6"></path>
              <path d="M21 12h-6m-6 0H3"></path>
            </svg>
          </div>
        )}
      </button>

      {/* Location Error Toast */}
      {locationError && (
        <div 
          className="fixed bottom-24 right-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs"
          style={{ zIndex: Z_INDEX.LOCATION_ERROR_TOAST }}
        >
          <div className="flex items-start gap-2">
            <div className="text-red-200">⚠️</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Location Error</div>
              <div className="text-xs text-red-100 mt-1">{locationError}</div>
            </div>
            <button 
              onClick={onClearLocationError}
              className="text-red-200 hover:text-white ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OverlayControls;