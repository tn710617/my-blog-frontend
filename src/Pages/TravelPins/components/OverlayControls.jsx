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
        className={`
          fixed bottom-6 right-6 w-16 h-16 rounded-2xl 
          backdrop-blur-md border transition-all duration-500 ease-out
          ${isLocating 
            ? 'bg-amber-900/80 border-amber-700/50 text-amber-200 cursor-not-allowed shadow-lg shadow-amber-900/50' 
            : 'bg-gradient-to-br from-emerald-900/90 to-teal-800/90 border-emerald-700/50 text-emerald-100 hover:from-emerald-800/95 hover:to-teal-700/95 hover:border-emerald-600/70 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 shadow-lg shadow-emerald-900/50'
          }
          active:scale-95 active:translate-y-0
        `}
        style={{ zIndex: Z_INDEX.GPS_BUTTON }}
        title={isLocating ? 'Getting location...' : 'Get current location'}
      >
        <div className="flex items-center justify-center relative">
          {isLocating ? (
            <div className="relative">
              {/* Animated location pulse */}
              <div className="animate-spin w-6 h-6 border-2 border-amber-200/60 border-t-amber-200 rounded-full"></div>
              <div className="absolute inset-0 animate-ping w-6 h-6 border border-amber-300/40 rounded-full"></div>
            </div>
          ) : (
            <div className="relative">
              {/* GPS crosshair with location pin */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div className="absolute -top-0.5 -right-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M12 1v6M12 17v6M21 12h-6M7 12H1"/>
                </svg>
              </div>
            </div>
          )}
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            isLocating 
              ? 'bg-gradient-radial from-amber-400/20 to-transparent opacity-100' 
              : 'bg-gradient-radial from-emerald-400/20 to-transparent opacity-0 hover:opacity-100'
          }`} />
        </div>
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