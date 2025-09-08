import React from 'react';
import {useMapStore} from './stores/mapStore';
import MapContainer from './components/MapContainer';
import MapLoadingIndicator from './components/MapLoadingIndicator';
import MobileGestureToggle from './components/MobileGestureToggle';
import SymbolsManager from './components/SymbolsManager';
import OverlayRoot from './components/OverlayRoot';
import LocationButton from './components/LocationButton';
import MapboxCooperativeGesturesOverlay from '../../Components/MapboxCooperativeGesturesOverlay';
import {useKeyboardHandlers} from './hooks/useKeyboardHandlers';
import {useLocationListener} from './hooks/useLocationListener';
import {useGeolocation} from './hooks/useGeolocation';
import {handleResize} from './utils/cameraHelpers';
import {useResponsive} from './hooks/useResponsive';

// Travel Pins New - Main Component
// Entry point for the new Travel Pins implementation
const TravelPinsNew = () => {
    const {mapInstance, isMobileGestureMode, mapRootEl} = useMapStore();
    const isMobile = useResponsive();
    const [showCooperativeOverlay, setShowCooperativeOverlay] = React.useState(false);
    const overlayHideTimerRef = React.useRef(null);

    // Centralized ESC handling (delete/photo/display)
    useKeyboardHandlers();

    // Listen for location selection from navbar search
    useLocationListener();

    // Geolocation hook for GPS positioning
    const {isLocating, locationError, getCurrentLocation, clearLocationError} = useGeolocation();

    // Show cooperative gestures overlay when user tries to scroll/page in scroll mode (mobile only)
    React.useEffect(() => {
        if (!mapInstance) return;
        if (!isMobile || isMobileGestureMode !== 'scroll') {
            setShowCooperativeOverlay(false);
            return;
        }

        const showAndDebounceHide = () => {
            // Show once; keep showing while user continues to scroll
            setShowCooperativeOverlay((prev) => prev || true);
            if (overlayHideTimerRef.current) clearTimeout(overlayHideTimerRef.current);
            overlayHideTimerRef.current = setTimeout(() => {
                setShowCooperativeOverlay(false);
                overlayHideTimerRef.current = null;
            }, 1200);
        };

        const onWheel = () => showAndDebounceHide();
        const onTouchMove = () => showAndDebounceHide();

        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchmove', onTouchMove);
            if (overlayHideTimerRef.current) {
                clearTimeout(overlayHideTimerRef.current);
                overlayHideTimerRef.current = null;
            }
        };
    }, [mapInstance, isMobileGestureMode, isMobile]);

    // Imperative toggle: disable/enable map interactions, cooperative gestures, and allow page scroll to pass through
    React.useEffect(() => {
        if (!mapInstance) return;
        const m = mapInstance;

        const disableAll = () => {
            try {
                m.keyboard?.disable?.();
                m.dragPan?.disable?.();
                m.scrollZoom?.disable?.();
                m.boxZoom?.disable?.();
                m.doubleClickZoom?.disable?.();
                m.touchZoomRotate?.disable?.();
                m.dragRotate?.disable?.();
            } catch {}
        };
        const enableAll = () => {
            try {
                m.keyboard?.enable?.();
                m.dragPan?.enable?.();
                m.scrollZoom?.enable?.();
                m.boxZoom?.enable?.();
                m.doubleClickZoom?.enable?.();
                m.touchZoomRotate?.enable?.();
                m.dragRotate?.enable?.();
            } catch {}
        };

        const root = mapRootEl;
        const desiredCoop = !isMobile ? true : (isMobileGestureMode === 'scroll');
        try {
            if (typeof m.getCooperativeGestures === 'function' && typeof m.setCooperativeGestures === 'function') {
                const current = m.getCooperativeGestures();
                if (current !== desiredCoop) m.setCooperativeGestures(desiredCoop);
            }
        } catch {}

        if (isMobile) {
            if (isMobileGestureMode === 'scroll') {
                disableAll();
                try { if (root) root.classList.add('map--pass-through'); } catch {}
            } else {
                enableAll();
                try { if (root) root.classList.remove('map--pass-through'); } catch {}
            }
        } else {
            // Desktop: always enable interactions (Cmd/Ctrl + 滾輪可用) 並移除穿透
            enableAll();
            try { if (root) root.classList.remove('map--pass-through'); } catch {}
        }

        return () => {
            // no-op; state changes will re-run effect
        };
    }, [mapInstance, mapRootEl, isMobileGestureMode, isMobile]);

    // Handle GPS location button click
    const handleGetCurrentLocation = React.useCallback(() => {
        if (!mapInstance) return;

        getCurrentLocation(({latitude, longitude}) => {
            // Use easeTo for smooth movement, zoom to street level
            mapInstance.flyTo({
                center: [longitude, latitude],
                zoom: Math.max(15, mapInstance.getZoom()), // Street level, but don't zoom out if already closer
                duration: 2500
            });
        });
    }, [mapInstance, getCurrentLocation]);

    // Handle window resize for map responsiveness
    React.useEffect(() => {
        const onResize = () => handleResize(mapInstance);
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, [mapInstance]);

    return (
        <div className="h-screen">
            <MapContainer/>
            <MapLoadingIndicator/>
            <MobileGestureToggle/>

            {/* SymbolLayer-based pins (no backside flicker) */}
            <SymbolsManager/>
            <OverlayRoot/>

            <LocationButton
                isLocating={isLocating}
                locationError={locationError}
                onGetCurrentLocation={handleGetCurrentLocation}
                onClearLocationError={clearLocationError}
            />

            <MapboxCooperativeGesturesOverlay
                show={showCooperativeOverlay}
                onDismiss={() => setShowCooperativeOverlay(false)}
            />
        </div>
    );
};

export default TravelPinsNew;
