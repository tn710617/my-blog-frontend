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
import {useResponsive} from './hooks/useResponsive';

// Travel Pins New - Main Component
// Entry point for the new Travel Pins implementation
const TravelPinsNew = () => {
    const {mapInstance, isMobileGestureMode, mapRootEl} = useMapStore();
    const isMobile = useResponsive();
    const overlayHideRafRef = React.useRef(null);
    const lastActivityTsRef = React.useRef(0);
    const HIDE_DELAY_MS = 1300;

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
            if (overlayHideRafRef.current) {
                cancelAnimationFrame(overlayHideRafRef.current);
                overlayHideRafRef.current = null;
            }
            return;
        }

        const showAndDebounceHide = () => {
            // Show once and extend visibility while user keeps interacting (RAF-based debounce)
            setShowCooperativeOverlay((prev) => true);
            lastActivityTsRef.current = performance.now();
            const tick = (now) => {
                // If user interactions paused for HIDE_DELAY_MS, hide the overlay
                if (now - lastActivityTsRef.current >= HIDE_DELAY_MS) {
                    setShowCooperativeOverlay(false);
                    overlayHideRafRef.current = null;
                    return;
                }
                overlayHideRafRef.current = requestAnimationFrame(tick);
            };

            // Start a RAF loop if not already running
            if (!overlayHideRafRef.current) {
                overlayHideRafRef.current = requestAnimationFrame(tick);
            }
        };

        const onWheel = () => showAndDebounceHide();
        const onTouchMove = () => showAndDebounceHide();

        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchmove', onTouchMove);
            if (overlayHideRafRef.current) {
                cancelAnimationFrame(overlayHideRafRef.current);
                overlayHideRafRef.current = null;
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

        if (isMobile) {
            if (isMobileGestureMode === 'scroll') {
                // Mobile scroll: cooperative on (語意一致)、禁用互動、事件穿透頁面
                try { if (typeof m.setCooperativeGestures === 'function') m.setCooperativeGestures(true); } catch {}
                disableAll();
                try { if (root) root.classList.add('map--pass-through'); } catch {}
            } else {
                // Mobile rotate: cooperative off，啟用互動並確保可旋轉
                try { if (typeof m.setCooperativeGestures === 'function') m.setCooperativeGestures(false); } catch {}
                enableAll();
                try { m.touchZoomRotate?.enableRotation?.(); } catch {}
                try { if (root) root.classList.remove('map--pass-through'); } catch {}
            }
        } else {
            // Desktop：先移除穿透 → 重置 scrollZoom → 開啟 cooperative → 再啟用互動
            try { if (root) root.classList.remove('map--pass-through'); } catch {}

            // 確保 blocker 容器正確建立：強制走 disable → enable 流程
            try { m.scrollZoom?.disable?.(); } catch {}
            try {
                if (typeof m.setCooperativeGestures === 'function') {
                    m.setCooperativeGestures(true);
                }
            } catch {}
            try { m.scrollZoom?.enable?.(); } catch {}

            // 其他互動照常啟用（dragPan/dragRotate/touchZoomRotate 等）
            enableAll();
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

    const [showCooperativeOverlay, setShowCooperativeOverlay] = React.useState(false);

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
                containerEl={mapRootEl}
            />
        </div>
    );
};

export default TravelPinsNew;
