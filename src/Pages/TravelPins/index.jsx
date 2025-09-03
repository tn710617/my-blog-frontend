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
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from './utils/palettes';
import { buildFootprintHTML } from './utils/footprintIcon';
import { renderMarkdownToHTML } from './utils/markdownUtils';
import { debounce } from './utils/debounceUtil';
import { customPopupStyles } from './utils/popupStyles';
import { assignColorsByScreen, recolorMarkers, createColorAssignmentRef } from './utils/colorManager';
import { Z_INDEX, Z_INDEX_CSS } from './utils/zIndex';
import { useFormState } from './hooks/useFormState';
import { useGeolocation } from './hooks/useGeolocation';
import { usePopupManager } from './hooks/usePopupManager';
import { useMapManager } from './hooks/useMapManager';


const TravelPins = () => {
  
  const intl = useIntl();
  const locale = useLocaleStore((state) => state.locale);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal);
  
  
  
  // 保存最新 auth 狀態，避免事件閉包拿到舊值
  const authRef = useRef(isLoggedIn);
  
  // 把 auth 狀態套用到某個 popup 容器
  const applyAuthButtonsVisibility = useCallback((rootEl, isAuth = authRef.current) => {
    if (!rootEl) return;
    const buttons = rootEl.querySelector('.auth-buttons-container');
    if (!buttons) return;
    buttons.classList.remove('auth-buttons-visible', 'auth-buttons-hidden');
    buttons.classList.add(isAuth ? 'auth-buttons-visible' : 'auth-buttons-hidden');
  }, []);
  
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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
  const [searchHistory, setSearchHistory] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEscModal, setShowEscModal] = useState(false);
  const [pendingDeletePin, setPendingDeletePin] = useState(null);
  const [pendingEscAction, setPendingEscAction] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalData, setPhotoModalData] = useState({ url: '', title: '' });
  const [coordsCopied, setCoordsCopied] = useState(false);
  const [mapboxModalActive, setMapboxModalActive] = useState(false);
  const mapboxModalActiveRef = useRef(false);
  // Marker style: fixed to footprint
  
  // Assigned color index per pin id
  const assignedColorsRef = useRef(createColorAssignmentRef());

  // Skin tone palette is defined globally as SKIN_SCHEMES


  // Inject custom popup styles
  useEffect(() => {
    const styleId = 'travel-pins-popup-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = customPopupStyles;
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Mobile detection effect
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to create/update/remove markers when pins change
  useEffect(() => {
    if (!map || !mapLoaded || !map.loaded?.()) {
      return;
    }

    // Compute screen-space color assignments up front
    try { 
      assignColorsByScreen(pins, map, assignedColorsRef.current); 
    } catch {}

    const markersById = markersByIdRef.current;

    const newIds = new Set(pins.map(p => p.id));
    const oldIds = new Set(markersByIdRef.current ? Array.from(markersById.keys()) : []);

    // Remove markers that no longer exist
    oldIds.forEach(id => {
      if (!newIds.has(id)) {
        const marker = markersById.get(id);
        if (marker) {
          marker.remove();
          // remove from markersRef list
          markersRef.current = markersRef.current.filter(m => m !== marker);
        }
        markersById.delete(id);
        // Also ensure it's removed from open popups set
        handlePopupClose(id);
      }
    });

    // Add or update markers for current pins
    pins.forEach((pin, index) => {
      const existing = markersById.get(pin.id);
      if (!existing) {
        const marker = createMarkerForPin(pin, index, map);
        if (marker) {
          markersById.set(pin.id, marker);
          markersRef.current.push(marker);
        }
      } else {
        try {
          // Update coordinates and popup content; preserve open state
          const prevPopup = existing.getPopup?.();
          const wasOpen = prevPopup?.isOpen?.() || false;
          existing.setLngLat(pin.coordinates);
          const updatedPopup = createEnhancedPopup(pin);
          existing.setPopup(updatedPopup);
          // Refresh marker element HTML (ensures current footprint style)
          const el = existing.getElement();
          if (el) {
            const assignment = assignedColorsRef.current.get(pin.id) || { palette: 'skin', idx: 1 };
            const idx = assignment.idx;
            const palette = assignment.palette;
            el.dataset.colorIdx = String(idx);
            el.dataset.palette = palette;
            const schemeList = palette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
            const scheme = schemeList[idx] || schemeList[0];
            try { el.innerHTML = buildFootprintHTML(scheme); } catch {}
          }
          if (wasOpen && prevPopup !== updatedPopup) {
            // Re-open after small tick to ensure DOM updates
            setTimeout(() => {
              try { existing.togglePopup(); } catch {}
            }, 0);
          }
        } catch {}
      }
    });

    return () => {
      // No-op here; global cleanup on unmount elsewhere
    };
  }, [pins.length, pins.map(p => p.id).join(','), mapLoaded]);  // More stable dependencies

  // Auth 改變時，立刻同步 ref，並更新所有已開啟的 popups
  useEffect(() => {
    authRef.current = isLoggedIn;

    // 更新目前畫面上所有已開啟的 popup
    const openPopupEls = document.querySelectorAll('[id^="popup-"]');
    openPopupEls.forEach(el => applyAuthButtonsVisibility(el, isLoggedIn));

    // 兼容你現有的 global 方法（若別處有呼叫）
    if (typeof window.updateTravelPinAuthButtons === 'function') {
      window.updateTravelPinAuthButtons(isLoggedIn);
    }

    // 再延遲一次，避免剛渲染的 DOM 尚未到位
    const t = setTimeout(() => {
      const delayedEls = document.querySelectorAll('[id^="popup-"]');
      delayedEls.forEach(el => applyAuthButtonsVisibility(el, isLoggedIn));
      if (typeof window.updateTravelPinAuthButtons === 'function') {
        window.updateTravelPinAuthButtons(isLoggedIn);
      }
    }, 100);

    return () => {
      clearTimeout(t);
    };
  }, [isLoggedIn, applyAuthButtonsVisibility]);

  // Add zoom handlers for popup closing behavior
  useEffect(() => {
    if (!map || !mapLoaded || !addZoomHandlers) return;

    const cleanup = addZoomHandlers(closeAllPopups);
    return cleanup;
  }, [mapLoaded, addZoomHandlers, closeAllPopups]);

  // Set mapbox token on mount
  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    setToken(mapboxToken);
  }, []);

  // Listen for location selection from navbar search
  useEffect(() => {
    const handleLocationFromNavbar = (event) => {
      const location = event.detail;
      
      // Navigate to the location on the map
      if (map && location.center) {
        flyTo(location.center, 10, 2000);
        
        // Add to search history
        const historyItem = {
          id: Date.now(),
          name: location.place_name,
          coordinates: location.center,
          timestamp: new Date()
        };
        
        setSearchHistory(prev => {
          const filtered = prev.filter(item => item.name !== historyItem.name);
          return [historyItem, ...filtered].slice(0, 5);
        });
      }
    };

    window.addEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    return () => {
      window.removeEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
    };
  }, [flyTo, map]);

  // Global functions for popup interactions
  useEffect(() => {
    // No-op: globals removed; compatibility hook retained for future needs
    return () => {};
  }, []);

  // Initialize modal state to false on mount
  useEffect(() => {
    setMapboxModalActive(false);
    mapboxModalActiveRef.current = false;
  }, []);

  // Monitor for Mapbox cooperative gesture modal using opacity detection
  useEffect(() => {
    let lastOpacity = 0;
    
    const checkScrollZoomBlocker = () => {
      const scrollBlocker = document.querySelector('.mapboxgl-scroll-zoom-blocker');
      if (!scrollBlocker) return;
      
      const style = window.getComputedStyle(scrollBlocker);
      const opacity = parseFloat(style.opacity);
      const isActive = opacity > 0;
      
      // Only log when opacity changes
      if (opacity !== lastOpacity) {
        lastOpacity = opacity;
      }
      
      if (isActive && !mapboxModalActiveRef.current) {
        mapboxModalActiveRef.current = true;
        setMapboxModalActive(true);
        
        // Disable marker interactions and reset hover states
        const markers = document.querySelectorAll('.travel-pin-marker');
        
        markers.forEach(marker => {
          marker.style.cursor = 'default';
          marker.classList.add('modal-active-disabled');
          
          // Reset any existing hover states
          const container = marker.querySelector('.marker-container');
          if (container) container.style.transform = 'scale(1)';
          marker.style.zIndex = Z_INDEX_CSS.MAP_MARKER_DEFAULT;
          marker.style.opacity = '1';
        });
        
      } else if (!isActive && mapboxModalActiveRef.current) {
        mapboxModalActiveRef.current = false;
        setMapboxModalActive(false);
        
        // Re-enable marker interactions
        const markers = document.querySelectorAll('.travel-pin-marker');
        
        markers.forEach(marker => {
          marker.style.cursor = 'pointer';
          marker.classList.remove('modal-active-disabled');
        });
      }
    };

    // Check every 100ms for opacity changes
    const interval = setInterval(checkScrollZoomBlocker, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []); // No dependencies needed


  // ESC key handler for form modal
  useEffect(() => {
    if (!showForm) return;

    const handleEscape = (e) => {
      // Don't handle ESC if search box is focused
      if (document.activeElement?.id === 'location-search-input') return;
      
      if (e.key === 'Escape') {
        if (!hasChanges) {
          // No changes made, close immediately
          handleCloseForm();
        } else {
          // Has changes, show confirmation dialog
          setPendingEscAction(() => handleCloseForm);
          setShowEscModal(true);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showForm, hasChanges]);

  // ESC key handler for delete modal
  useEffect(() => {
    if (!showDeleteModal) return;

    const handleDeleteModalEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelDeletePin();
      }
    };

    document.addEventListener('keydown', handleDeleteModalEscape);
    return () => document.removeEventListener('keydown', handleDeleteModalEscape);
  }, [showDeleteModal]);

  // ESC key handler for photo modal (highest priority)
  useEffect(() => {
    if (!showPhotoModal) return;

    const handlePhotoModalEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Stop all other ESC handlers
        closePhotoModal();
      }
    };

    // Add with capture=true for higher priority
    document.addEventListener('keydown', handlePhotoModalEscape, true);
    return () => document.removeEventListener('keydown', handlePhotoModalEscape, true);
  }, [showPhotoModal]);

  // Body overflow control via hook
  useBodyScrollLock(
    showPhotoModal || (openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal)
  );

  // ESC key handler for closing display popups (when form is not open)
  useEffect(() => {
    if (showForm || showDeleteModal || showEscModal || showPhotoModal) return; // Don't handle ESC when modals are open

    const handleEscapeForPopups = (e) => {
      if (e.key === 'Escape') {
        // Double-check modal states to prevent conflicts
        if (showPhotoModal || showForm || showDeleteModal || showEscModal) {
          return; // Exit early if any modal is open
        }
        
        if (openPopups.size > 0) {
          // Close all open popups
          markersRef.current.forEach(marker => {
            if (marker.getPopup() && marker.getPopup().isOpen()) {
              marker.getPopup().remove();
            }
          });
          closeAllPopups();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeForPopups);
    return () => document.removeEventListener('keydown', handleEscapeForPopups);
  }, [showForm, showDeleteModal, showEscModal, showPhotoModal, openPopups]);






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
    
    // Store the pin for potential popup restoration
    setPendingDeletePin(pin);
    // Close all popups when opening delete modal
    closeAllPopups();
    setShowDeleteModal(true);
  };

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
    setShowDeleteModal(false);
    setPendingDeletePin(null);
  };

  const cancelDeletePin = () => {
    setShowDeleteModal(false);

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

    setPendingDeletePin(null);
  };

  const confirmEscAction = () => {
    if (pendingEscAction) {
      pendingEscAction();
    }
    setShowEscModal(false);
    setPendingEscAction(null);
  };

  const cancelEscAction = () => {
    setShowEscModal(false);
    setPendingEscAction(null);
  };

  // Photo modal handlers
  const openPhotoModal = (photoUrl, photoTitle) => {
    setPhotoModalData({ url: photoUrl, title: photoTitle });
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoModalData({ url: '', title: '' });
  };

  // Copy coordinates functionality
  const handleCopyCoordinates = async (coordinates, pinId) => {
    const coordText = `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
    
    // Get the button element if pinId is provided (for popup buttons)
    const buttonElement = pinId ? document.getElementById(`copy-btn-${pinId}`) : null;
    
    try {
      await navigator.clipboard.writeText(coordText);
      showCopySuccess(buttonElement);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = coordText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showCopySuccess(buttonElement);
    }
  };

  // Visual feedback for copy success
  const showCopySuccess = (buttonElement) => {
    if (buttonElement) {
      // Store original content
      const originalContent = buttonElement.innerHTML;
      
      // Show success state
      buttonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <span class="text-sm font-medium">${t('travel_pins.popup.copied')}</span>
      `;
      buttonElement.className = buttonElement.className.replace(
        'from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border-emerald-200 hover:border-emerald-300',
        'from-green-100 to-emerald-100 text-green-700 border-green-300'
      );
      
      // Restore original after 2 seconds
      setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.className = buttonElement.className.replace(
          'from-green-100 to-emerald-100 text-green-700 border-green-300',
          'from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border-emerald-200 hover:border-emerald-300'
        );
      }, 2000);
    } else {
      // Fallback for non-popup buttons
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxgl.accessToken}&` +
          `types=country&` +
          `limit=8&` +
          `autocomplete=true`
        );
        
        const data = await response.json();
        setSearchSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input changes


  // Handle GPS location request
  const handleGetCurrentLocation = () => {
    getCurrentLocation(({ latitude, longitude }) => {
      // Fly to current location with smooth animation
      flyTo([longitude, latitude], 14, 2500);
    });
  };

  // (Pin style removed — using footprint only)

  // Helper to set footprint HTML
  const setMarkerInnerHTML = (el, scheme) => {
    el.innerHTML = buildFootprintHTML(scheme);
  };

  const createMarkerForPin = (pin, index, map) => {
    // Defensive check: ensure map is available and ready
    if (!map) {
      console.error('createMarkerForPin called with undefined map:', { pin: pin.id, map });
      return null;
    }

    // Additional check: ensure map has a valid container and is loaded (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      const mapContainer = map.getContainer?.();
      if (!mapContainer || !mapContainer.parentNode) {
        console.error('createMarkerForPin called but map container is not attached to DOM:', { 
          pin: pin.id, 
          hasContainer: !!mapContainer,
          hasParent: !!mapContainer?.parentNode 
        });
        return null;
      }
      
      // Additional check: ensure map is actually loaded
      if (!map.loaded?.()) {
        console.error('createMarkerForPin called but map is not loaded:', { pin: pin.id });
        return null;
      }
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'travel-pin-marker';
    
    // Choose assigned palette for this pin
    const assignment = assignedColorsRef.current.get(pin.id) || { palette: 'skin', idx: 1 };
    const idx = assignment.idx;
    const palette = assignment.palette;
    const schemeList = palette === 'contrast' ? CONTRAST_SCHEMES : SKIN_SCHEMES;
    const scheme = schemeList[idx] || schemeList[0];
    el.dataset.colorIdx = String(idx);
    el.dataset.palette = palette;

    // Inject the chosen style HTML
    setMarkerInnerHTML(el, scheme);
    
    // Use exact same CSS as accurate debug crosshair
    // Default fully opaque; we only lower opacity on hover
    // Use centralized z-index management to stay below Mapbox notification modals
    el.style.cssText = `position: absolute; pointer-events: auto; cursor: pointer; z-index: ${Z_INDEX_CSS.MAP_MARKER_DEFAULT}; opacity: 1;`;

    // Hover effect (disabled when Mapbox gesture modal is active)
    const getContainer = () => el.querySelector('.marker-container');
    el.addEventListener('mouseenter', () => {
      // Don't apply hover effects when Mapbox gesture modal is active
      if (mapboxModalActiveRef.current) return;
      
      const container = getContainer();
      if (container) container.style.transform = 'scale(1.12)';
      // Keep below form overlay, popup overlay, and Mapbox notification modals
      el.style.zIndex = Z_INDEX_CSS.MAP_MARKER_HOVER;
      el.style.opacity = '0.65';
    });

    el.addEventListener('mouseleave', () => {
      // Always reset on mouse leave to prevent stuck states
      const container = getContainer();
      if (container) container.style.transform = 'scale(1)';
      el.style.zIndex = Z_INDEX_CSS.MAP_MARKER_DEFAULT;
      el.style.opacity = '1';
    });

    const popup = createEnhancedPopup(pin);

    try {
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center' // Use same anchor strategy as accurate crosshair
      })
        .setLngLat(pin.coordinates)
        .setPopup(popup);

      // Add click event to show popup (after marker is created)
      el.addEventListener('click', (e) => {
        // Prevent marker interaction when Mapbox gesture modal is active
        if (mapboxModalActiveRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        e.stopPropagation(); // Prevent map click event
        marker.togglePopup(); // Show the popup
      });

      marker.addTo(map);
      return marker;
    } catch (error) {
      console.error('Failed to create/add marker:', { pin: pin.id, error: error.message });
      return null;
    }
    
    // Debug: Add crosshair marker for coordinate verification (after backend fix)
    // if (process.env.NODE_ENV === 'development') {
    //   const debugEl = document.createElement('div');
    //   debugEl.innerHTML = `
    //     <div style="
    //       position: absolute;
    //       top: -10px;
    //       left: -10px;
    //       width: 20px;
    //       height: 20px;
    //       pointer-events: none;
    //     ">
    //       <div style="
    //         position: absolute;
    //         top: 9px;
    //         left: 0;
    //         width: 20px;
    //         height: 2px;
    //         background: red;
    //         opacity: 0.8;
    //       "></div>
    //       <div style="
    //         position: absolute;
    //         top: 0;
    //         left: 9px;
    //         width: 2px;
    //         height: 20px;
    //         background: red;
    //         opacity: 0.8;
    //       "></div>
    //     </div>
    //   `;
    //   debugEl.style.cssText = 'position: absolute; pointer-events: none; z-index: 1000;';
    //   
    //   new mapboxgl.Marker({
    //     element: debugEl,
    //     anchor: 'center'
    //   })
    //     .setLngLat(pin.coordinates)
    //     .addTo(map.current);
    // }
  };

  const createEnhancedPopup = (pin) => {
    const popupId = `popup-${pin.id}`;
    
    // Fixed center positioning for all devices
    const popupConfig = {
      closeButton: false,
      closeOnClick: false,
      className: 'travel-pin-popup travel-pin-popup-center',
      anchor: 'center',
      offset: [0, 0],
      maxWidth: 'none'
    };
    
    const popup = new mapboxgl.Popup(popupConfig).setHTML(
      buildPopupHTML(pin, { t, formatDate, isMobile, isLoggedIn, popupId, renderMarkdownToHTML })
    );
    
    // Add event listeners to track popup state
    popup.on('open', () => {
      handlePopupOpen(pin.id);

      // Improve mobile scrollability: stop events from reaching the map
      // and ensure the popup scroll container has momentum scrolling.
      try {
        const container = document.getElementById(popupId);
        
        if (container) {
          // 以當下最新的 auth 狀態，立即刷新按鈕可見性
          applyAuthButtonsVisibility(container);
          // Delegate click handling to the container to avoid timing issues
          try {
            const onContainerClick = (e) => {
              const actionEl = e.target.closest('[data-action]');
              if (!actionEl || !container.contains(actionEl)) return;
              e.stopPropagation();
              const action = actionEl.getAttribute('data-action');
              switch (action) {
                case 'delete':
                  handleDeletePin(pin);
                  break;
                case 'edit':
                  handleEditPin(pin);
                  break;
                case 'copy':
                  handleCopyCoordinates(pin.coordinates, pin.id);
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
            // Save handler reference for cleanup
            container.__tp_onClick = onContainerClick;
            container.addEventListener('click', onContainerClick);
          } catch {}
        }
        // 再下一輪事件執行一次，避免瀏覽器延後繪製
        setTimeout(() => {
          const el = document.getElementById(popupId);
          if (el) applyAuthButtonsVisibility(el);
        }, 0);
        
        const popupEl = container?.closest('.mapboxgl-popup');
        if (popupEl) {
          popupEl.style.webkitOverflowScrolling = 'touch';
          popupEl.style.overscrollBehavior = 'contain';
          popupEl.style.touchAction = 'pan-y';
        }

        if (container) {
          // Make the modal box itself scrollable with momentum on iOS
          container.style.maxHeight = '85vh';
          container.style.overflowY = 'auto';
          container.style.webkitOverflowScrolling = 'touch';
          container.style.overscrollBehavior = 'contain';
        }

      } catch (err) {
      }
    });
    
    popup.on('close', () => {
      handlePopupClose(pin.id);
      
      // Cleanup delegated handler if present
      try {
        const container = document.getElementById(popupId);
        if (container && container.__tp_onClick) {
          container.removeEventListener('click', container.__tp_onClick);
          delete container.__tp_onClick;
        }
      } catch {}
    });
    
    return popup;
  };

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

      {/* GPS Location Button */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isLocating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1'
        }`}
        style={{ zIndex: Z_INDEX.GPS_BUTTON }}
        title={isLocating ? 'Getting location...' : 'Get current location'}
      >
        {isLocating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6"></path>
              <path d="M21 12h-6m-6 0H3"></path>
            </svg>
          </div>
        )}
      </button>

      {/* Location Error Toast */}
      {locationError && (
        <div 
          className="fixed bottom-24 right-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs"
          style={{ zIndex: Z_INDEX.LOCATION_ERROR_TOAST }}
        >
          <div className="flex items-start gap-2">
            <div className="text-red-200">⚠️</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Location Error</div>
              <div className="text-xs text-red-100 mt-1">{locationError}</div>
            </div>
            <button 
              onClick={clearLocationError}
              className="text-red-200 hover:text-white ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

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
      {showEscModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[420px] max-w-[90vw] animate-scale-up">
            {/* Warning header with amber gradient */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white px-6 py-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  💾
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight leading-tight m-0">Unsaved Changes</h3>
                  <p className="text-sm opacity-90 mt-1">You have unsaved changes</p>
                </div>
              </div>
            </div>
            
            {/* Modal content */}
            <div className="p-6 space-y-5">
              {/* Warning content */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">
                      ✏️
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Current Form</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {editingPin ? `Editing: ${editingPin.title}` : 'Creating New Pin'}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        You have made changes that haven't been saved yet.
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action explanation */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                      💡
                    </div>
                    <div className="text-sm text-slate-700">
                      <div className="font-semibold mb-1">What would you like to do?</div>
                      <div>You can go back to continue editing, or discard your changes and close the form.</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelEscAction}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
                >
                  Continue Editing
                </button>
                <button
                  onClick={confirmEscAction}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal/Lightbox */}
      <PhotoLightbox open={showPhotoModal} data={photoModalData} onClose={closePhotoModal} />


    </div>
  );
};

export default TravelPins;
