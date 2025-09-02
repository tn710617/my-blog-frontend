import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing popup state and interactions
 * Handles mobile single-popup policy, map interaction disabling, and popup tracking
 */
export const usePopupManager = ({ 
  isMobile, 
  pins, 
  markersRef, 
  mapRef,
  showForm,
  onCloseForm 
}) => {
  const [openPopups, setOpenPopups] = useState(new Set());

  /**
   * Close all open popups by removing them from markers
   */
  const closeAllPopups = useCallback(() => {
    if (markersRef?.current) {
      markersRef.current.forEach(marker => {
        if (marker.getPopup() && marker.getPopup().isOpen()) {
          marker.getPopup().remove();
        }
      });
    }
    setOpenPopups(new Set());
  }, [markersRef]);

  /**
   * Add a popup to the open popups set
   */
  const addOpenPopup = useCallback((pinId) => {
    setOpenPopups(prev => new Set(prev).add(pinId));
  }, []);

  /**
   * Remove a popup from the open popups set
   */
  const removeOpenPopup = useCallback((pinId) => {
    setOpenPopups(prev => {
      const newSet = new Set(prev);
      newSet.delete(pinId);
      return newSet;
    });
  }, []);

  /**
   * Enable map interactions (scrolling, etc.)
   */
  const enableMapInteractions = useCallback(() => {
    try {
      if (mapRef?.current) {
        mapRef.current.scrollZoom?.enable();
        mapRef.current.boxZoom?.enable();
        mapRef.current.dragRotate?.enable();
        mapRef.current.dragPan?.enable();
        mapRef.current.keyboard?.enable();
        mapRef.current.doubleClickZoom?.enable();
        mapRef.current.touchZoomRotate?.enable();
      }
    } catch (error) {
      console.warn('Failed to enable map interactions:', error);
    }
  }, [mapRef]);

  /**
   * Disable map interactions to prevent gesture conflicts with popup scrolling
   */
  const disableMapInteractions = useCallback(() => {
    try {
      if (mapRef?.current) {
        mapRef.current.scrollZoom?.disable();
        mapRef.current.boxZoom?.disable();
        mapRef.current.dragRotate?.disable();
        mapRef.current.dragPan?.disable();
        mapRef.current.keyboard?.disable();
        mapRef.current.doubleClickZoom?.disable();
        mapRef.current.touchZoomRotate?.disable();
      }
    } catch (error) {
      console.warn('Failed to disable map interactions:', error);
    }
  }, [mapRef]);

  /**
   * Handle popup open event - adds to tracking and disables map interactions
   */
  const handlePopupOpen = useCallback((pinId) => {
    addOpenPopup(pinId);
    disableMapInteractions();
  }, [addOpenPopup, disableMapInteractions]);

  /**
   * Handle popup close event - removes from tracking and re-enables map interactions
   */
  const handlePopupClose = useCallback((pinId) => {
    removeOpenPopup(pinId);
    enableMapInteractions();
  }, [removeOpenPopup, enableMapInteractions]);

  // Mobile single popup policy enforcement
  useEffect(() => {
    if (isMobile && openPopups.size > 1) {
      // Keep only the most recently opened popup (last in the Set)
      const popupArray = Array.from(openPopups);
      const mostRecentPopupId = popupArray[popupArray.length - 1];
      
      // Close all popups except the most recent one
      if (markersRef?.current && pins) {
        markersRef.current.forEach(marker => {
          const popup = marker.getPopup();
          if (popup && popup.isOpen()) {
            // Find the pin associated with this marker
            const markerPin = pins.find(p => {
              const markerCoords = marker.getLngLat();
              return p.coordinates && 
                     Math.abs(p.coordinates[0] - markerCoords.lng) < 0.0001 &&
                     Math.abs(p.coordinates[1] - markerCoords.lat) < 0.0001;
            });
            
            if (markerPin && markerPin.id !== mostRecentPopupId) {
              popup.remove();
            }
          }
        });
        
        // Update the state to reflect only the most recent popup
        setOpenPopups(new Set([mostRecentPopupId]));
      }
    }
  }, [isMobile, openPopups, pins, markersRef]);

  // Close display popups when edit form opens
  useEffect(() => {
    if (showForm && openPopups.size > 0) {
      closeAllPopups();
    }
  }, [showForm, closeAllPopups, openPopups.size]);

  // Close edit form when display popup opens (display popup takes priority)
  useEffect(() => {
    if (!showForm && openPopups.size > 0) {
      // Display popup just opened, nothing to do
      return;
    }
    if (showForm && openPopups.size > 0 && onCloseForm) {
      // Both are open, close edit form (display popup takes priority)
      onCloseForm();
    }
  }, [openPopups, showForm, onCloseForm]);

  return {
    openPopups,
    closeAllPopups,
    addOpenPopup,
    removeOpenPopup,
    handlePopupOpen,
    handlePopupClose,
    enableMapInteractions,
    disableMapInteractions
  };
};