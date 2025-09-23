import React from 'react';
import { useIntl } from 'react-intl';
import { useMapStore } from '../stores/mapStore';
import { Z_INDEX } from '../utils';
import { useResponsive } from '../hooks/useResponsive';

const MobileGestureToggle = () => {
  const intl = useIntl();
  const { isMobileGestureMode, toggleMobileGestureMode } = useMapStore();
  const isMobile = useResponsive();

  // Only show on mobile devices
  if (!isMobile) return null;

  const isScrollMode = isMobileGestureMode === 'scroll';

  const icon = isScrollMode ? (
    // Globe icon when current behavior is: finger = page scroll (cooperativeGestures: true)
    <div className="relative">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <div className="absolute -top-1 -right-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
          <polyline points="7.5,19.79 7.5,14.6 3,12"/>
          <polyline points="21,12 16.5,14.6 16.5,19.79"/>
        </svg>
      </div>
    </div>
  ) : (
    // Document icon when current behavior is: finger = rotate/pan map (cooperativeGestures: false)
    <div className="relative">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="2" width="18" height="20" rx="2" ry="2"/>
        <line x1="7" y1="7" x2="17" y2="7"/>
        <line x1="7" y1="11" x2="17" y2="11"/>
        <line x1="7" y1="15" x2="13" y2="15"/>
      </svg>
      <div className="absolute -top-1 -right-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7-7 7 7"/>
        </svg>
      </div>
    </div>
  );

  const zIndex = Z_INDEX.GPS_BUTTON;

  return (
    <button
      onClick={toggleMobileGestureMode}
      className={`
        fixed bottom-6 left-6 w-16 h-16 rounded-2xl 
        backdrop-blur-sm border transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg hover:-translate-y-0.5
        active:scale-95 active:translate-y-0 z-[${zIndex}]
        ${isScrollMode 
          ? 'bg-white/90 border-stone-300/60 text-stone-700 hover:bg-white/95 hover:border-stone-400/70 shadow-md shadow-stone-900/20' 
          : 'bg-gradient-to-br from-sky-500/90 to-blue-600/90 border-sky-400/50 text-white hover:from-sky-400/95 hover:to-blue-500/95 hover:border-sky-300/70 shadow-md shadow-blue-900/30'
        }
      `}
      title={intl.formatMessage({
        id: isScrollMode ? 'travel_pins.mobile_toggle.scroll_mode' : 'travel_pins.mobile_toggle.rotation_mode'
      })}
    >
      <div className="flex items-center justify-center relative">
        {icon}
        {/* Subtle accent effect */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isScrollMode 
            ? 'bg-gradient-radial from-stone-500/10 to-transparent opacity-0 hover:opacity-100' 
            : 'bg-gradient-radial from-sky-300/15 to-transparent opacity-0 hover:opacity-100'
        }`} />
      </div>
    </button>
  );
};

export default MobileGestureToggle;
