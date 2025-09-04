// React and external libraries
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIntl } from 'react-intl';

// Global stores and APIs
import { useLocaleStore, useAuthStore, useLoginModalStore } from '../../stores';
import { useTravelPins, useCreateTravelPin, useUpdateTravelPin, useDeleteTravelPin } from '../../APIs/travel-pins';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

// Local components
import OverlayControls from './components/OverlayControls';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorIndicator from './components/ErrorIndicator';
import BackgroundOverlay from './components/BackgroundOverlay';
import ModalManager from './components/ModalManager';

// Local hooks
import { useFormState } from './hooks/useFormState';
import { useGeolocation } from './hooks/useGeolocation';
import { usePopupManager } from './hooks/usePopupManager';
import { useMapManager } from './hooks/useMapManager';
import { useModalManager } from './hooks/useModalManager';
import { useMarkerEffects } from './hooks/useMarkerEffects';
import { useKeyboardHandlers } from './hooks/useKeyboardHandlers';
import { useMapboxModalDetection } from './hooks/useMapboxModalDetection';
import { useAuthEffects } from './hooks/useAuthEffects';
import { useLocationListener } from './hooks/useLocationListener';

// Local utilities
import { buildPopupHTML } from './popupHtml';
import { renderMarkdownToHTML } from './utils/markdownUtils';
import { assignColorsByScreen, recolorMarkers, createColorAssignmentRef } from './utils/colorManager';
import { Z_INDEX } from './utils/zIndex';
import { createMarkerForPin } from './utils/markerFactory';
import { createEnhancedPopup } from './utils/popupFactory';
import { handleCopyCoordinates } from './utils/coordinateUtils';
import { injectTravelPinsStyles } from './utils/styleInjection';
import { updateOpenPopupContent } from './utils/popupUpdater';


const TravelPins = () => {
  // Stores and utilities
  const intl = useIntl();
  const locale = useLocaleStore((state) => state.locale);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal);
  const { authRef, applyAuthButtonsVisibility } = useAuthEffects(isLoggedIn);
  
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [token, setToken] = useState('');
  
  // Refs for color management
  const assignedColorsRef = useRef(createColorAssignmentRef());
  
  // Helper function to get translated text for use in HTML strings
  const t = (key) => intl.formatMessage({id: key});
  
  // Helper function to format dates with current locale
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(locale, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString; // Fallback to original string
    }
  };
  
  // API hooks and data
  const { data: rawPins = [], isLoading: pinsLoading, error: pinsError } = useTravelPins();
  const createPinMutation = useCreateTravelPin();
  const updatePinMutation = useUpdateTravelPin();
  const deletePinMutation = useDeleteTravelPin();
  
  // Memoized pins to prevent unnecessary re-renders
  const pins = useMemo(() => rawPins, [rawPins.length, rawPins.map(p => `${p.id}-${p.updated_at}`).join(',')]);
  
  // Custom hooks
  const {
    formData, hasChanges, originalFormData, handleInputChange, initializeForm,
    resetForm, createNewForm, isFormValid, getFormDataForSubmission
  } = useFormState();
  
  const { isLocating, locationError, getCurrentLocation, clearLocationError } = useGeolocation();
  
  const {
    showDeleteModal, showEscModal, pendingDeletePin, showPhotoModal, photoModalData,
    coordsCopied, setCoordsCopied, openDeleteModal, closeDeleteModal, openEscModal,
    closeEscModal, confirmEscAction, openPhotoModal, closePhotoModal
  } = useModalManager();

  // Form close handler (needed by popup manager hook)
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingPin(null);
    resetForm();
  }, [resetForm]);

  // Stable callback functions for map manager
  const handleMapClick = useCallback((lngLat) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setEditingPin(null);
    createNewForm(lngLat.toArray());
    setShowForm(true);
  }, [isLoggedIn, setShowLoginModal, createNewForm, setEditingPin, setShowForm]);

  const handleMapLoad = useCallback((mapInstance, markersById) => {
    try { recolorMarkers(pins, mapInstance, markersById, assignedColorsRef.current); } catch {}
  }, []);

  const handleRecolorMarkers = useCallback((mapInstance, markersById) => {
    try { recolorMarkers(pins, mapInstance, markersById, assignedColorsRef.current); } catch {}
  }, []);

  // Map and popup management
  const {
    mapContainer, map, markersRef, markersByIdRef, mapLoaded, mapError,
    flyTo, getZoom, addZoomHandlers
  } = useMapManager({
    pins, mapboxToken: token, locale, intl,
    onMapClick: handleMapClick, onMapLoad: handleMapLoad, onRecolorMarkers: handleRecolorMarkers
  });
  
  const { isMobile, searchHistory } = useLocationListener(mapLoaded ? map : null, flyTo);
  const { openPopups, closeAllPopups, handlePopupOpen, handlePopupClose } = usePopupManager({
    isMobile, pins, markersRef, mapRef: { current: map }, showForm, onCloseForm: handleCloseForm
  });

  // Color management
  const handleAssignColorsByScreen = useCallback((allPins) => {
    if (map) assignColorsByScreen(allPins, map, assignedColorsRef.current);
  }, [map]);
  
  // === PIN ACTION HANDLERS ===
  const handleEditPin = (pin) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    closeAllPopups();
    const originalData = {
      title: pin.title,
      note: pin.note || '',
      visited_at: pin.visited_at || '',
      photo_url: pin.photo_url || '',
      photos: pin.photos || [],
      coordinates: pin.coordinates
    };
    setEditingPin(pin);
    initializeForm(originalData);
    setShowForm(true);
  };

  const handleDeletePin = (pin) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    closeAllPopups();
    openDeleteModal(pin);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const pinData = getFormDataForSubmission();
    try {
      if (editingPin) {
        await updatePinMutation.mutateAsync({ id: editingPin.id, pinData });
      } else {
        await createPinMutation.mutateAsync(pinData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('💾 Failed to save pin:', error);
    }
  };

  // === MODAL HANDLERS ===
  const cancelDeletePin = () => {
    if (pendingDeletePin) {
      const marker = markersByIdRef.current.get(pendingDeletePin.id);
      if (marker && marker.getPopup()) {
        setTimeout(() => {
          try {
            closeAllPopups();
            marker.togglePopup();
          } catch (e) {}
        }, 200);
      }
    }
    closeDeleteModal();
  };

  const confirmDeletePin = async () => {
    if (pendingDeletePin) {
      try {
        await deletePinMutation.mutateAsync(pendingDeletePin.id);
        handlePopupClose(pendingDeletePin.id);
        try {
          const marker = markersByIdRef.current.get(pendingDeletePin.id);
          if (marker) {
            marker.remove();
            markersRef.current = markersRef.current.filter(m => m !== marker);
            markersByIdRef.current.delete(pendingDeletePin.id);
          }
        } catch {}
      } catch (error) {
        console.error('Failed to delete pin:', error);
      }
    }
    closeDeleteModal();
  };

  const cancelEscAction = closeEscModal;
  
  
  // Mapbox modal detection
  const { mapboxModalActive, mapboxModalActiveRef } = useMapboxModalDetection();


  // Initialize styles and token on mount
  useEffect(() => {
    // Inject custom popup styles
    const styleCleanup = injectTravelPinsStyles();
    
    // Set mapbox token
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    setToken(mapboxToken);
    // Also set the global mapbox token for search functionality
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }
    
    // Return cleanup function for styles
    return styleCleanup;
  }, []);

  // Add zoom handlers for popup closing behavior
  useEffect(() => {
    if (!map || !mapLoaded || !addZoomHandlers) return;

    const cleanup = addZoomHandlers(closeAllPopups);
    return cleanup;
  }, [mapLoaded, addZoomHandlers, closeAllPopups]);



  // Handle keyboard events
  useKeyboardHandlers({
    showForm,
    showDeleteModal,
    showEscModal,
    showPhotoModal,
    hasChanges,
    openPopups,
    handleCloseForm,
    openEscModal,
    cancelDeletePin,
    closePhotoModal,
    closeAllPopups,
    markersRef
  });

  // Body overflow control via hook
  useBodyScrollLock(
    showPhotoModal || (openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal)
  );




  // Location and popup helpers
  const getCurrentPinData = useCallback((pinId) => pins.find(p => p.id === pinId), [pins]);
  
  const handleGetCurrentLocation = () => {
    getCurrentLocation(({ latitude, longitude }) => flyTo([longitude, latitude], 14, 2500));
  };

  const createEnhancedPopupForPin = (pin) => {
    return createEnhancedPopup(pin, {
      t,
      formatDate,
      isMobile,
      isLoggedIn,
      renderMarkdownToHTML,
      handlePopupOpen,
      handlePopupClose,
      applyAuthButtonsVisibility,
      handleDeletePin,
      handleEditPin,
      handleCopyCoordinates: (coords, pinId) => handleCopyCoordinates(coords, pinId, t, setCoordsCopied),
      openPhotoModal,
      getCurrentPinData
    });
  };

  const createMarkerForPinWithDeps = useCallback((pin, index, map) => 
    createMarkerForPin(pin, index, map, assignedColorsRef, mapboxModalActiveRef, createEnhancedPopupForPin),
    [createEnhancedPopupForPin]
  );

  // === EFFECTS ===
  // Marker lifecycle management
  useMarkerEffects({
    map,
    mapLoaded,
    pins,
    assignedColorsRef,
    markersRef,
    markersByIdRef,
    createMarkerForPinWithDeps,
    handlePopupClose,
    createEnhancedPopupForPin
  });

  // Update popup content when pins change
  useEffect(() => {
    updateOpenPopupContent({
      pins,
      map,
      mapLoaded,
      markersByIdRef,
      t,
      formatDate,
      isMobile,
      isLoggedIn,
      renderMarkdownToHTML,
      applyAuthButtonsVisibility,
      handleDeletePin,
      handleEditPin,
      openPhotoModal,
      setCoordsCopied
    });
  }, [pins.map(p => `${p.id}-${p.updated_at}-${p.title}-${p.note}`).join(','), map, mapLoaded, t, formatDate, isMobile, isLoggedIn, renderMarkdownToHTML, applyAuthButtonsVisibility, handleDeletePin, handleEditPin, openPhotoModal, setCoordsCopied]);

  
  return (
    <div className="w-full h-screen relative">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Marker Style Toggle removed: footprint only */}

      {/* Loading indicator */}
      <LoadingIndicator isLoading={pinsLoading} />
      
      {/* Error indicator */}
      <ErrorIndicator error={pinsError} />

      {/* Background overlay for display modal (popup) */}
      <BackgroundOverlay 
        show={openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal}
        onClick={closeAllPopups}
      />

      {/* Overlay Controls (GPS button and location error toast) */}
      <OverlayControls
        isLocating={isLocating}
        locationError={locationError}
        onGetCurrentLocation={handleGetCurrentLocation}
        onClearLocationError={clearLocationError}
      />

      {/* All Modals */}
      <ModalManager
        showForm={showForm}
        editingPin={editingPin}
        formData={formData}
        t={t}
        formatDate={formatDate}
        handleInputChange={handleInputChange}
        handleCloseForm={handleCloseForm}
        handleSavePin={handleSavePin}
        showDeleteModal={showDeleteModal}
        pendingDeletePin={pendingDeletePin}
        cancelDeletePin={cancelDeletePin}
        confirmDeletePin={confirmDeletePin}
        showEscModal={showEscModal}
        cancelEscAction={cancelEscAction}
        confirmEscAction={confirmEscAction}
        showPhotoModal={showPhotoModal}
        photoModalData={photoModalData}
        closePhotoModal={closePhotoModal}
      />


    </div>
  );
};

export default TravelPins;
