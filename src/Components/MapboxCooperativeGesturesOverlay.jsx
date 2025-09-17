import React from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';

const MapboxCooperativeGesturesOverlay = ({
  show = true,
  className = "",
  containerEl = null,
}) => {
    const intl = useIntl();

    if (!show) return null;

    const message = intl.formatMessage({ id: 'mapbox.touch_pan_blocker.message' });

    const overlayNode = (
      <div
        className={`flex items-center justify-center  ${className}`}
        style={{
          position: containerEl ? 'absolute' : 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div className="text-white px-6 py-4 text-xl font-medium text-center">
          {message}
        </div>
      </div>
    );

    // If a container element is provided (map root), render overlay inside it so it won't cover navbar
    if (containerEl) {
      return createPortal(overlayNode, containerEl);
    }

    return overlayNode;
};

export default MapboxCooperativeGesturesOverlay;
