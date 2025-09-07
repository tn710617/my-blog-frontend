import React from 'react';
import { useIntl } from 'react-intl';
import { Z_INDEX } from '../utils/zIndex';

/**
 * Location button component for GPS positioning
 * Displays floating GPS button over the map interface
 */
const LocationButton = ({
  isLocating,
  locationError,
  onGetCurrentLocation,
  onClearLocationError
}) => {
  const intl = useIntl();

  return (
    <>
      {/* GPS Location Button */}
      <button
        onClick={onGetCurrentLocation}
        disabled={isLocating}
        className={`
          fixed bottom-6 right-6 w-16 h-16 rounded-2xl 
          backdrop-blur-sm border transition-all duration-300 ease-out
          ${isLocating 
            ? 'bg-orange-400/90 border-orange-300/60 text-white cursor-not-allowed shadow-md shadow-orange-900/20' 
            : 'bg-gradient-to-br from-emerald-500/90 to-green-600/90 border-emerald-400/50 text-white hover:from-emerald-400/95 hover:to-green-500/95 hover:border-emerald-300/70 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 shadow-md shadow-green-900/30'
          }
          active:scale-95 active:translate-y-0
        `}
        style={{ zIndex: Z_INDEX.GPS_BUTTON }}
        title={isLocating 
          ? intl.formatMessage({ id: 'travel_pins.location.getting_location' }) 
          : intl.formatMessage({ id: 'travel_pins.location.get_current_location' })
        }
      >
        <div className="flex items-center justify-center relative">
          {isLocating ? (
            <div className="relative">
              {/* Animated location pulse */}
              <div className="animate-spin w-6 h-6 border-2 border-white/60 border-t-white rounded-full"></div>
              <div className="absolute inset-0 animate-ping w-6 h-6 border border-white/40 rounded-full"></div>
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
          {/* Subtle accent effect */}
          <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            isLocating 
              ? 'bg-gradient-radial from-orange-300/15 to-transparent opacity-100' 
              : 'bg-gradient-radial from-emerald-300/15 to-transparent opacity-0 hover:opacity-100'
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
              <div className="font-medium text-sm">
                {intl.formatMessage({ id: 'travel_pins.location.error_title' })}
              </div>
              <div className="text-xs text-red-100 mt-1">{locationError}</div>
            </div>
            <button 
              onClick={onClearLocationError}
              className="text-red-200 hover:text-white ml-2"
              title={intl.formatMessage({ id: 'travel_pins.location.clear_error' })}
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

export default LocationButton;