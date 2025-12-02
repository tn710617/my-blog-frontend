import React from 'react';
import { useIntl } from 'react-intl';
import { Z_INDEX } from '../utils/zIndex';

/**
 * Place Pin button (paw icon) - drops a pin at current map center
 */
const PlacePinButton = ({ onPlacePin, disabled = false }) => {
  const intl = useIntl();

  return (
    <button
      type="button"
      onClick={onPlacePin}
      disabled={disabled}
      className={`
        fixed bottom-24 right-6 w-16 h-16 rounded-2xl
        backdrop-blur-sm border transition-all duration-300 ease-out
        ${disabled
          ? 'bg-purple-300/70 border-purple-200/60 text-white cursor-not-allowed shadow-md shadow-purple-900/15'
          : 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 border-purple-300/70 text-white hover:from-purple-400/95 hover:to-indigo-500/95 hover:border-purple-200/80 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5 shadow-md shadow-purple-900/25'
        }
        active:scale-95 active:translate-y-0
      `}
      style={{ zIndex: Z_INDEX.GPS_BUTTON + 1 }}
      title={intl.formatMessage({ id: 'travel_pins.place_pin_here', defaultMessage: 'Drop pin at current view' })}
    >
      <div className="flex items-center justify-center relative">
        {/* Cat paw icon */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <path
            d="M32 36c-7 0-14 5.5-14 12.5S25 60 32 60s14-5.5 14-11.5S39 36 32 36Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M21 26c0-4 2.8-7 6-7s6 3 6 7-2.8 7-6 7-6-3-6-7Zm-9 4c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5S18.8 35 17 35s-5-2.5-5-5Zm34-4c0-4-2.8-7-6-7s-6 3-6 7 2.8 7 6 7 6-3 6-7Zm9 4c0-3-2.2-5.5-5-5.5s-5 2.5-5 5.5S40.2 35 42 35s5-2.5 5-5Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M32 36c-7 0-14 5.5-14 12.5S25 60 32 60s14-5.5 14-11.5S39 36 32 36Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 26c0-4 2.8-7 6-7s6 3 6 7-2.8 7-6 7-6-3-6-7Zm-9 4c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5S18.8 35 17 35s-5-2.5-5-5Zm34-4c0-4-2.8-7-6-7s-6 3-6 7 2.8 7 6 7 6-3 6-7Zm9 4c0-3-2.2-5.5-5-5.5s-5 2.5-5 5.5S40.2 35 42 35s5-2.5 5-5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            disabled
              ? 'bg-gradient-radial from-purple-200/20 to-transparent opacity-70'
              : 'bg-gradient-radial from-purple-200/25 to-transparent opacity-0 hover:opacity-100'
          }`}
        />
      </div>
    </button>
  );
};

export default PlacePinButton;
