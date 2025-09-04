import {useRef, useState, useEffect, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';

/**
 * Custom hook for managing Mapbox map instance and lifecycle
 * Handles map initialization, event listeners, and cleanup
 */
export const useMapManager = ({
                                  onMapClick,
                                  onMapLoad,
                                  onRecolorMarkers,
                              }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const markersByIdRef = useRef(new Map());

    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    /**
     * Initialize the Mapbox map
     */
    const initializeMap = useCallback(() => {
        if (!token) return;
        if (map.current) return; // Initialize map only once

        // Check container availability (skip in test environment)
        if (!mapContainer.current && process.env.NODE_ENV !== 'test') {
            console.error('Map container not available during initialization');
            return;
        }

        mapboxgl.accessToken = token;

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('useMapManager: Initializing new map instance');
            }


            // Detect mobile device for positioning
            const isMobile = window.innerWidth <= 768 ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // Adjust center position for mobile - move earth higher (more negative latitude)
            const center = isMobile ? [0, -15] : [0, 0];

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: center,
                zoom: 2,
                projection: 'globe',    // Enable globe projection for 3D earth view
                attributionControl: false,
                logoPosition: 'bottom-right',
                doubleClickZoom: true,
                touchZoomRotate: true,  // Enables two-finger zoom and rotate on mobile
                dragRotate: true,       // Allows rotation with mouse + modifier key on desktop
                dragPan: true,          // Desktop pan with mouse
                keyboard: true,
                touchPitch: true,       // Two-finger pitch/tilt on mobile
                pitchWithRotate: true,  // Enable pitch when rotating
            });

            // Handle map load event
            map.current.on('load', () => {
                // Double-check that map is actually loaded before setting state
                if (map.current && map.current.loaded()) {
                    setMapLoaded(true);
                    if (onMapLoad) {
                        onMapLoad(map.current, markersByIdRef.current);
                    }
                }
            });

            // Handle map errors
            map.current.on('error', (e) => {
                console.error('Map error:', e);
                const errorMessage = e.error?.message || 'Map failed to load';
                setMapError(errorMessage);
            });

            // Add move and zoom end handlers for recoloring markers
            if (onRecolorMarkers) {
                const onMoveEnd = () => {
                    try {
                        onRecolorMarkers(map.current, markersByIdRef.current);
                    } catch (error) {
                    }
                };

                const onZoomEnd = () => {
                    try {
                        onRecolorMarkers(map.current, markersByIdRef.current);
                    } catch (error) {
                    }
                };

                map.current.on('moveend', onMoveEnd);
                map.current.on('zoomend', onZoomEnd);

                // Store handlers for cleanup
                map.current._tpHandlers = {onMoveEnd, onZoomEnd};
            }

            // Add click handler for empty areas (not pins)
            if (onMapClick) {
                const handleMapClick = (e) => {
                    // Check if the click target is a pin marker
                    const target = e.originalEvent.target;
                    const isPinMarker = target.closest && (
                        target.closest('.tp-marker') ||
                        target.classList.contains('tp-marker')
                    );

                    if (!isPinMarker) {
                        onMapClick(e.lngLat);
                    }
                };

                map.current.on('click', handleMapClick);
                map.current._tpMapClickHandler = handleMapClick;
            }


        } catch (error) {
            console.error('Failed to create map:', error);
            setMapError(error.message);
        }
    }, [token, onMapLoad, onRecolorMarkers, onMapClick]);

    /**
     * Fly to a specific location
     */
    const flyTo = useCallback((center, zoom = 10, duration = 2500) => {
        if (map.current) {
            map.current.flyTo({
                center,
                zoom,
                duration
            });
        }
    }, []);

    /**
     * Get current map zoom level
     */
    const getZoom = useCallback(() => {
        return map.current?.getZoom() || 0;
    }, []);

    /**
     * Add zoom event handlers with popup closing logic
     */
    const addZoomHandlers = useCallback((closeAllPopups) => {
        if (!map.current) return;

        let hasClosedPopups = false;
        let zoomTimeout = null;
        let zoomStartLevel = null;

        const handleZoomStart = () => {
            zoomStartLevel = map.current.getZoom();
            hasClosedPopups = false;
        };

        const handleZoom = () => {
            clearTimeout(zoomTimeout);
            zoomTimeout = setTimeout(() => {
                // Only check zoom level if we haven't already closed popups
                if (!hasClosedPopups && zoomStartLevel !== null) {
                    const currentZoomLevel = map.current.getZoom();
                    const zoomDifference = Math.abs(currentZoomLevel - zoomStartLevel);

                    // Close popups if zoom difference is >= 0.1 (significant zoom change)
                    if (zoomDifference >= 0.1) {
                        closeAllPopups();
                        hasClosedPopups = true;
                    }
                }
            }, 100); // Small delay to batch rapid zoom changes
        };

        const handleZoomEnd = () => {
            clearTimeout(zoomTimeout);
            zoomStartLevel = null;
            hasClosedPopups = false;
        };

        map.current.on('zoomstart', handleZoomStart);
        map.current.on('zoom', handleZoom);
        map.current.on('zoomend', handleZoomEnd);

        // Store handlers and timeout for cleanup
        map.current._tpZoomHandlers = {
            handleZoomStart,
            handleZoom,
            handleZoomEnd,
            zoomTimeout
        };

        // Return cleanup function
        return () => {
            if (map.current) {
                map.current.off('zoomstart', handleZoomStart);
                map.current.off('zoom', handleZoom);
                map.current.off('zoomend', handleZoomEnd);
            }
            clearTimeout(zoomTimeout);
        };
    }, []);

    /**
     * Clean up all event handlers and destroy map
     */
    const cleanup = useCallback(() => {
        if (map.current) {
            try {
                if (process.env.NODE_ENV === 'development') {
                    console.log('useMapManager: Cleaning up map instance');
                }
                // Clean up custom event handlers
                if (map.current._tpHandlers) {
                    const {onMoveEnd, onZoomEnd} = map.current._tpHandlers;
                    map.current.off('moveend', onMoveEnd);
                    map.current.off('zoomend', onZoomEnd);
                }

                // Clean up zoom handlers
                if (map.current._tpZoomHandlers) {
                    const {handleZoomStart, handleZoom, handleZoomEnd, zoomTimeout} = map.current._tpZoomHandlers;
                    map.current.off('zoomstart', handleZoomStart);
                    map.current.off('zoom', handleZoom);
                    map.current.off('zoomend', handleZoomEnd);
                    clearTimeout(zoomTimeout);
                }

                // Clean up map click handler
                if (map.current._tpMapClickHandler) {
                    map.current.off('click', map.current._tpMapClickHandler);
                }


                // Remove the map instance
                map.current.remove();
                map.current = null;
            } catch (error) {
            }
        }

        // Reset map state
        setMapLoaded(false);
        setMapError(null);

        // Clean up markers
        markersRef.current = [];
        markersByIdRef.current.clear();
    }, []);

    // Initialize map when component mounts
    useEffect(() => {
        initializeMap();

        // Cleanup on unmount
        return cleanup;
    }, [initializeMap, cleanup]);

    // Trigger reinitialization when token becomes available
    useEffect(() => {
        if (token && !map.current) {
            initializeMap();
        }
    }, [token, initializeMap]);

    return {
        mapContainer,
        map: map.current,
        markersRef,
        markersByIdRef,
        mapLoaded,
        mapError,
        flyTo,
        getZoom,
        addZoomHandlers,
        cleanup
    };
};