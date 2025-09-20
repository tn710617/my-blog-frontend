import React from 'react';
import {createPortal} from 'react-dom';
import {useIntl} from 'react-intl';
import {Z_INDEX} from "../Pages/TravelPinsNew/utils";

const MapboxCooperativeGesturesOverlay = ({
                                              show = true,
                                              className = "",
                                              containerEl = null,
                                          }) => {
    const intl = useIntl();

    if (!show) return null;

    const message = intl.formatMessage({id: 'mapbox.touch_pan_blocker.message'});

    const positionStyle = containerEl ? 'absolute' : 'fixed';
    const zIndexStyle = `z-${Z_INDEX.MAPBOX_GESTURE_OVERLAY}`;

    const overlayNode = (
        <div
            className={`flex items-center justify-center bg-black/80 pointer-events-none inset-0 ${zIndexStyle} ${positionStyle} ${className}`}
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
