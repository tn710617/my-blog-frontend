import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIntl } from 'react-intl';
import { useLocaleStore, useAuthStore, useLoginModalStore } from '../../stores';
import { useTravelPins, useCreateTravelPin, useUpdateTravelPin, useDeleteTravelPin } from '../../APIs/travel-pins';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { buildPopupHTML } from './popupHtml';
import PinForm from './components/PinForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import PhotoLightbox from './components/PhotoLightbox';
import OverlayControls from './components/OverlayControls';
import EscConfirmationModal from './components/EscConfirmationModal';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from './utils/palettes';
import { renderMarkdownToHTML } from './utils/markdownUtils';
import { assignColorsByScreen, recolorMarkers, createColorAssignmentRef } from './utils/colorManager';
import { Z_INDEX, Z_INDEX_CSS } from './utils/zIndex';
import { createMarkerForPin } from './utils/markerFactory';
import { createEnhancedPopup } from './utils/popupFactory';
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
import { handleCopyCoordinates } from './utils/coordinateUtils';
import { injectTravelPinsStyles } from './utils/styleInjection';


const TravelPins = () => {
  
  const intl = useIntl();
  const locale = useLocaleStore((state) => state.locale);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal);
  
  
  
  // Authentication effects and button visibility management
  const { authRef, applyAuthButtonsVisibility } = useAuthEffects(isLoggedIn);
  
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
  
  // API hooks
  const { data: rawPins = [], isLoading: pinsLoading, error: pinsError } = useTravelPins();
  
  // Memoize pins to prevent unnecessary re-renders when the array reference changes
  const pins = useMemo(() => {
    return rawPins;
  }, [rawPins.length, rawPins.map(p => `${p.id}-${p.updated_at}`).join(',')]);
  
  const createPinMutation = useCreateTravelPin();
  const updatePinMutation = useUpdateTravelPin();
  const deletePinMutation = useDeleteTravelPin();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [token, setToken] = useState('');
  // Form state management
  const {
    formData,
    hasChanges,
    originalFormData,
    handleInputChange,
    initializeForm,
    resetForm,
    createNewForm,
    isFormValid,
    getFormDataForSubmission
  } = useFormState();

  // Geolocation functionality
  const { isLocating, locationError, getCurrentLocation, clearLocationError } = useGeolocation();


  // Modal state management
  const {
    showDeleteModal,
    showEscModal,
    pendingDeletePin,
    showPhotoModal,
    photoModalData,
    coordsCopied,
    setCoordsCopied,
    openDeleteModal,
    closeDeleteModal,
    openEscModal,
    closeEscModal,
    confirmEscAction,
    openPhotoModal,
    closePhotoModal
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
    try { 
      recolorMarkers(pins, mapInstance, markersById, assignedColorsRef.current);
    } catch (error) {
    }
  }, []);  // Remove pins dependency to prevent recreation

  const handleRecolorMarkers = useCallback((mapInstance, markersById) => {
    try {
      recolorMarkers(pins, mapInstance, markersById, assignedColorsRef.current);
    } catch (error) {
    }
  }, []);  // Remove pins dependency to prevent recreation

  // Map management functionality
  
  const {
    mapContainer,
    map,
    markersRef,
    markersByIdRef,
    mapLoaded,
    mapError,
    flyTo,
    getZoom,
    addZoomHandlers
  } = useMapManager({
    pins,
    mapboxToken: token,
    locale,
    intl,
    onMapClick: handleMapClick,
    onMapLoad: handleMapLoad,
    onRecolorMarkers: handleRecolorMarkers
  });
  
  // Location listener functionality (mobile detection & navbar search)
  const { isMobile, searchHistory } = useLocationListener(mapLoaded ? map : null, flyTo);

  // Color management functions (now that map is available)
  const handleAssignColorsByScreen = useCallback((allPins) => {
    if (map) {
      assignColorsByScreen(allPins, map, assignedColorsRef.current);
    }
  }, [map]);

  // Popup management functionality
  const { 
    openPopups, 
    closeAllPopups, 
    handlePopupOpen, 
    handlePopupClose 
  } = usePopupManager({
    isMobile,
    pins,
    markersRef,
    mapRef: { current: map },
    showForm,
    onCloseForm: handleCloseForm
  });
  
  // Action handlers (defined before keyboard handlers that use them)
  const handleEditPin = (pin) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Show login modal for unauthenticated users
      setShowLoginModal(true);
      return;
    }
    
    // Close all display popups when opening edit form
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
    // Check if user is logged in
    if (!isLoggedIn) {
      // Show login modal for unauthenticated users
      setShowLoginModal(true);
      return;
    }
    
    // Close all popups when opening delete modal
    closeAllPopups();
    openDeleteModal(pin);
  };

  const cancelDeletePin = () => {
    // Restore the original popup after a brief delay
    if (pendingDeletePin) {
      const marker = markersByIdRef.current.get(pendingDeletePin.id);
      if (marker && marker.getPopup()) {
        setTimeout(() => {
          try {
            // Ensure all other popups remain closed, then open this one
            closeAllPopups();
            marker.togglePopup();
          } catch (e) {
          }
        }, 200); // Small delay to ensure modal closes smoothly
      }
    }

    closeDeleteModal();
  };

  const cancelEscAction = () => {
    closeEscModal();
  };
  
  
  // Mapbox modal detection
  const { mapboxModalActive, mapboxModalActiveRef } = useMapboxModalDetection();
  // Marker style: fixed to footprint
  
  // Assigned color index per pin id
  const assignedColorsRef = useRef(createColorAssignmentRef());

  // Skin tone palette is defined globally as SKIN_SCHEMES


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






  const confirmDeletePin = async () => {
    if (pendingDeletePin) {
      try {
        await deletePinMutation.mutateAsync(pendingDeletePin.id);
        // Remove from open popups tracking
        handlePopupClose(pendingDeletePin.id);
        // Remove marker immediately for instant UI feedback
        try {
          const marker = markersByIdRef.current.get(pendingDeletePin.id);
          if (marker) {
            marker.remove();
            // purge from refs
            markersRef.current = markersRef.current.filter(m => m !== marker);
            markersByIdRef.current.delete(pendingDeletePin.id);
          }
        } catch {}
      } catch (error) {
        console.error('Failed to delete pin:', error);
        // Error handling is done in the mutation
      }
    }
    closeDeleteModal();
  };



  // Handle GPS location request
  const handleGetCurrentLocation = () => {
    getCurrentLocation(({ latitude, longitude }) => {
      // Fly to current location with smooth animation
      flyTo([longitude, latitude], 14, 2500);
    });
  };

  // (Pin style removed — using footprint only)


  // Function to get current pin data by ID
  const getCurrentPinData = useCallback((pinId) => {
    return pins.find(p => p.id === pinId);
  }, [pins]);

  // Create enhanced popup with all dependencies
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

  // Create marker using utility function (memoized to prevent infinite loops)
  const createMarkerForPinWithDeps = useCallback((pin, index, map) => {
    return createMarkerForPin(
      pin,
      index,
      map,
      assignedColorsRef,
      mapboxModalActiveRef,
      createEnhancedPopupForPin
    );
  }, [createEnhancedPopupForPin]); // Only depends on popup creation function

  // Use marker effects hook to handle marker lifecycle
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

  // Separate effect to update popup content when pins change (without infinite loops)
  useEffect(() => {
    if (!map || !mapLoaded || !pins.length) return;

    // Update popup content for existing markers when pin data changes
    pins.forEach(pin => {
      const marker = markersByIdRef.current.get(pin.id);
      if (marker) {
        const popup = marker.getPopup();
        if (popup && popup.isOpen && popup.isOpen()) {
          // Only update if popup is currently open
          // Get the popup container and update its content directly
          const popupElement = popup.getElement();
          if (popupElement) {
            // Find the content container and update it
            const contentContainer = popupElement.querySelector(`#popup-${pin.id}`);
            if (contentContainer) {
              // Clean up old event handlers first
              if (contentContainer.__tp_onClick) {
                contentContainer.removeEventListener('click', contentContainer.__tp_onClick);
                delete contentContainer.__tp_onClick;
              }
              
              // Update the content without recreating the entire popup
              contentContainer.innerHTML = buildPopupHTML(pin, { 
                t, 
                formatDate, 
                isMobile, 
                isLoggedIn, 
                popupId: `popup-${pin.id}`, 
                renderMarkdownToHTML 
              }).match(/<div[^>]*id="popup-[^"]*"[^>]*>([\s\S]*)<\/div>/)[1];
              
              // Reapply auth button visibility
              applyAuthButtonsVisibility(contentContainer);
              
              // Re-attach event handlers with current pin data
              const onContainerClick = (e) => {
                const actionEl = e.target.closest('[data-action]');
                if (!actionEl || !contentContainer.contains(actionEl)) return;
                e.stopPropagation();
                const action = actionEl.getAttribute('data-action');
                switch (action) {
                  case 'delete':
                    handleDeletePin(pin);
                    break;
                  case 'edit':
                    // Use current pin data from pins array
                    const currentPin = pins.find(p => p.id === pin.id);
                    handleEditPin(currentPin || pin);
                    break;
                  case 'copy':
                    handleCopyCoordinates(pin.coordinates, pin.id, t, setCoordsCopied);
                    break;
                  case 'open-photo':
                    if (pin.photo_url) openPhotoModal(pin.photo_url, pin.title);
                    break;
                  case 'close':
                    try { popup.remove(); } catch {}
                    break;
                  default:
                    break;
                }
              };
              
              // Save handler reference for cleanup and attach it
              contentContainer.__tp_onClick = onContainerClick;
              contentContainer.addEventListener('click', onContainerClick);
            }
          }
        }
      }
    });
  }, [pins.map(p => `${p.id}-${p.updated_at}-${p.title}-${p.note}`).join(','), map, mapLoaded, t, formatDate, isMobile, isLoggedIn, renderMarkdownToHTML, applyAuthButtonsVisibility, handleDeletePin, handleEditPin, openPhotoModal, setCoordsCopied]); // Only when actual pin content changes


  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }
    
    // Check if user is logged in for create/edit operations
    if (!isLoggedIn) {
      // Show login modal for unauthenticated users
      setShowLoginModal(true);
      return;
    }

    const pinData = getFormDataForSubmission();

    try {
      if (editingPin) {
        // Update existing pin
        await updatePinMutation.mutateAsync({ 
          id: editingPin.id, 
          pinData 
        });
      } else {
        // Create new pin
        await createPinMutation.mutateAsync(pinData);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('💾 Failed to save pin:', error);
      // Error handling is done in the mutation
    }
  };

  
  return (
    <div className="w-full h-screen relative">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Marker Style Toggle removed: footprint only */}

      {/* Loading indicator */}
      {pinsLoading && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-10">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Loading pins...</span>
          </div>
        </div>
      )}
      
      {/* Error indicator */}
      {pinsError && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-lg z-10">
          <div className="flex items-center gap-2 text-red-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span className="text-sm font-medium">Failed to load pins</span>
          </div>
        </div>
      )}

      {/* Background overlay for display modal (popup) */}
      {openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.POPUP_BACKGROUND }}
          onClick={closeAllPopups}
        />
      )}

      {/* Refactored Pin Creation/Edit Form */}
      {showForm && (
        <PinForm
          editing={!!editingPin}
          t={t}
          formData={formData}
          setField={handleInputChange}
          formatDate={formatDate}
          onCancel={handleCloseForm}
          onSubmit={handleSavePin}
        />
      )}

      {/* Overlay Controls (GPS button and location error toast) */}
      <OverlayControls
        isLocating={isLocating}
        locationError={locationError}
        onGetCurrentLocation={handleGetCurrentLocation}
        onClearLocationError={clearLocationError}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          pin={pendingDeletePin}
          onCancel={cancelDeletePin}
          onConfirm={confirmDeletePin}
          formatDate={formatDate}
          t={t}
        />
      )}

      {/* ESC Key Confirmation Modal */}
      <EscConfirmationModal
        open={showEscModal}
        editingPin={editingPin}
        onCancel={cancelEscAction}
        onConfirm={confirmEscAction}
      />

      {/* Photo Modal/Lightbox */}
      <PhotoLightbox open={showPhotoModal} data={photoModalData} onClose={closePhotoModal} />


    </div>
  );
};

export default TravelPins;
