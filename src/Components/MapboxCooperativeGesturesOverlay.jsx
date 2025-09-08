import React, {useState, useEffect} from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';

const MapboxCooperativeGesturesOverlay = ({
  show = true,
  onDismiss,
  className = "",
  containerEl = null,
}) => {
    const [isVisible, setIsVisible] = useState(show);
    const intl = useIntl();

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

    const message = intl.formatMessage({ id: 'mapbox.touch_pan_blocker.message' });

    const overlayNode = (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          position: containerEl ? 'absolute' : 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div className="text-white px-6 py-4 text-base font-medium max-w-sm text-center">
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
