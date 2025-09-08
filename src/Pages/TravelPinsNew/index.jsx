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
    const {mapInstance, isMobileGestureMode} = useMapStore();
    const isMobile = useResponsive();
    const [showCooperativeOverlay, setShowCooperativeOverlay] = React.useState(false);

    // Centralized ESC handling (delete/photo/display)
    useKeyboardHandlers();

    // Listen for location selection from navbar search
    useLocationListener();

    // Geolocation hook for GPS positioning
    const {isLocating, locationError, getCurrentLocation, clearLocationError} = useGeolocation();

    // Show cooperative gestures overlay when in scroll mode
    React.useEffect(() => {
        if (mapInstance && isMobileGestureMode === 'scroll') {
            // Show overlay briefly when switching to cooperative gestures mode
            setShowCooperativeOverlay(true);
            
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setShowCooperativeOverlay(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [mapInstance, isMobileGestureMode]);

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

            {/*<MapboxCooperativeGesturesOverlay*/}
            {/*    show={showCooperativeOverlay}*/}
            {/*    onDismiss={() => setShowCooperativeOverlay(false)}*/}
            {/*    isMobile={isMobile}*/}
            {/*/>*/}
        </div>
    );
};

export default TravelPinsNew;
