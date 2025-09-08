import React, {useState, useEffect} from 'react';
import { useIntl } from 'react-intl';

const MapboxCooperativeGesturesOverlay = ({
  show = true,
  onDismiss,
  className = ""
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

    return (
        <div
            className={`fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center ${className}`}
            style={{pointerEvents: 'none'}}
        >
            {/* Mapbox-style message: white text centered on the full-screen overlay */}
            <div className="text-white px-6 py-4 text-base font-medium max-w-sm text-center">
                {message}
            </div>
        </div>
    );
};

export default MapboxCooperativeGesturesOverlay;
