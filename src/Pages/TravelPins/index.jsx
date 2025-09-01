import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMarkdown from 'react-markdown';
import { useIntl } from 'react-intl';
import { useLocaleStore } from '../../stores';

// Custom styles to override default Mapbox popup styling
const customPopupStyles = `
  .travel-pin-popup .mapboxgl-popup-content {
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    max-width: none !important;
    width: auto !important;
  }
  
  .travel-pin-popup .mapboxgl-popup-close-button {
    display: none !important;
  }
  
  .travel-pin-popup .mapboxgl-popup-tip {
    border-top-color: rgb(99 102 241) !important;
  }
  
  /* Center popup in screen */
  .travel-pin-popup-center {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 1000 !important;
    max-height: 90vh !important;
    max-width: 90vw !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
  }
  
  .travel-pin-popup-center .mapboxgl-popup-content {
    position: relative !important;
    transform: none !important;
    max-height: none !important;
    overflow: visible !important;
  }
  
  .travel-pin-popup-center .mapboxgl-popup-tip {
    display: none !important;
  }
  
  /* Modal animation */
  .animate-scale-up {
    animation: scaleUp 0.2s ease-out;
  }
  
  @keyframes scaleUp {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Utility function to convert markdown to HTML
const renderMarkdownToHTML = (markdown) => {
  if (!markdown) return '';
  
  // Basic markdown to HTML conversion for popup display
  return markdown
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const TravelPins = () => {
  const intl = useIntl();
  const locale = useLocaleStore((state) => state.locale);
  
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
      console.warn('Date formatting error:', error);
      return dateString; // Fallback to original string
    }
  };
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [pins, setPins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    visited_at: '',
    photo_url: '',
    photos: [],
    coordinates: null
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [openPopups, setOpenPopups] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEscModal, setShowEscModal] = useState(false);
  const [pendingDeletePin, setPendingDeletePin] = useState(null);
  const [pendingEscAction, setPendingEscAction] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalData, setPhotoModalData] = useState({ url: '', title: '' });
  const [coordsCopied, setCoordsCopied] = useState(false);

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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Separate effect for zoom handling with debounce
  useEffect(() => {
    if (!map.current) return;
    
    let zoomStartLevel = null;
    let hasClosedPopups = false;
    let zoomTimeout = null;
    
    const closeAllPopups = () => {
      
      let closedCount = 0;
      
      // Method 1: Close popups using pins state
      pins.forEach((pin, index) => {
        if (pin.marker && pin.marker.getPopup()) {
          const popup = pin.marker.getPopup();
          if (popup.isOpen()) {
            popup.remove();
            closedCount++;
          }
        }
      });
      
      // Method 2: Fallback - close any remaining popups via DOM
      const remainingPopups = document.querySelectorAll('.mapboxgl-popup');
      if (remainingPopups.length > 0) {
        remainingPopups.forEach(popup => {
          if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
        });
      }
      
      hasClosedPopups = true;
    };

    const handleZoomStart = () => {
      zoomStartLevel = map.current.getZoom();
      hasClosedPopups = false;
      
      // Clear any existing timeout
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
      }
    };

    const handleZoom = () => {
      // Only check zoom level if we haven't already closed popups
      if (!hasClosedPopups && zoomStartLevel !== null) {
        const currentZoomLevel = map.current.getZoom();
        const zoomDifference = Math.abs(currentZoomLevel - zoomStartLevel);
        
        
        // Close popups if zoom difference is >= 0.1 (significant zoom change)
        if (zoomDifference >= 0.1) {
          closeAllPopups();
        }
      }
    };

    const handleZoomEnd = () => {
      // Reset tracking variables with slight delay to ensure all zoom events are processed
      zoomTimeout = setTimeout(() => {
        zoomStartLevel = null;
        hasClosedPopups = false;
      }, 100);
    };

    map.current.on('zoomstart', handleZoomStart);
    map.current.on('zoom', handleZoom);
    map.current.on('zoomend', handleZoomEnd);

    return () => {
      if (map.current) {
        map.current.off('zoomstart', handleZoomStart);
        map.current.off('zoom', handleZoom);
        map.current.off('zoomend', handleZoomEnd);
      }
      // Clear timeout if component unmounts
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
    };
  }, [pins]); // Depend on pins so we can access current markers

  useEffect(() => {
    // Debug token
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidG43MTA2MTciLCJhIjoiY21leWM3anFmMHRnOTJxb2llcjJ6dnZpeSJ9.oHx0C295B4I2X21tPKsaMA';
    setToken(mapboxToken);
    
    mapboxgl.accessToken = mapboxToken;

    if (map.current) return; // Initialize map only once


    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 2,
        cooperativeGestures: true,
        locale: {
          'ScrollZoomBlocker.CtrlMessage': t('mapbox.scroll_zoom_blocker.ctrl_message'),
          'ScrollZoomBlocker.CmdMessage': t('mapbox.scroll_zoom_blocker.cmd_message'),
          'TouchPanBlocker.Message': t('mapbox.touch_pan_blocker.message')
        }
      });


      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(e.error?.message || 'Map failed to load');
      });

      // Add click handler - only for empty areas (not pins)
      map.current.on('click', (e) => {
        // Check if the click target is a pin marker
        const target = e.originalEvent.target;
        if (target && target.classList.contains('travel-pin-marker')) {
          // Don't open form if clicking on a pin - let the popup handle it
          return;
        }
        
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        const newFormData = {
          title: '',
          note: '',
          visited_at: '',
          photo_url: '',
          photos: [],
          coordinates
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        setHasChanges(false);
        setShowForm(true);
      });

    } catch (error) {
      console.error('Failed to create map:', error);
      setMapError(error.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Listen for location selection from navbar search
  useEffect(() => {
    const handleLocationFromNavbar = (event) => {
      const location = event.detail;
      
      // Navigate to the location on the map
      if (map.current && location.center) {
        map.current.flyTo({
          center: location.center,
          zoom: 10,
          duration: 2000
        });
        
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
    return () => window.removeEventListener('travelPinsLocationSelect', handleLocationFromNavbar);
  }, []);

  // Global functions for popup interactions
  useEffect(() => {
    window.editTravelPin = (pinId) => {
      const pin = pins.find(p => p.id === pinId);
      if (pin) {
        handleEditPin(pin);
      }
    };

    window.deleteTravelPin = (pinId) => {
      const pin = pins.find(p => p.id === pinId);
      if (pin) {
        handleDeletePin(pin);
      }
    };

    window.closeTravelPinPopup = (pinId) => {
      const pin = pins.find(p => p.id === pinId);
      if (pin && pin.marker) {
        pin.marker.getPopup().remove();
        // State tracking is handled by popup 'close' event listener
      }
    };

    window.openTravelPinPhoto = (photoUrl, photoTitle) => {
      openPhotoModal(photoUrl, photoTitle);
    };

    window.copyTravelPinCoordinates = (lng, lat, pinId) => {
      handleCopyCoordinates([parseFloat(lng), parseFloat(lat)], pinId);
    };

    return () => {
      delete window.editTravelPin;
      delete window.deleteTravelPin;
      delete window.closeTravelPinPopup;
      delete window.openTravelPinPhoto;
      delete window.copyTravelPinCoordinates;
    };
  }, [pins]);

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

  // ESC key handler for photo modal
  useEffect(() => {
    if (!showPhotoModal) return;

    const handlePhotoModalEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePhotoModal();
      }
    };

    document.addEventListener('keydown', handlePhotoModalEscape);
    return () => document.removeEventListener('keydown', handlePhotoModalEscape);
  }, [showPhotoModal]);

  // Body overflow control for photo modal
  useEffect(() => {
    if (showPhotoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPhotoModal]);

  // Body overflow control for display popups
  useEffect(() => {
    const anyBlockingLayer = openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal;
    if (anyBlockingLayer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openPopups, showForm, showDeleteModal, showEscModal, showPhotoModal]);

  // ESC key handler for closing display popups (when form is not open)
  useEffect(() => {
    if (showForm || showDeleteModal || showEscModal || showPhotoModal) return; // Don't handle ESC when modals are open

    const handleEscapeForPopups = (e) => {
      
      if (e.key === 'Escape') {
        if (openPopups.size > 0) {
          // Close all open popups
          pins.forEach(pin => {
            if (pin.marker && pin.marker.getPopup().isOpen()) {
              pin.marker.getPopup().remove();
            }
          });
          setOpenPopups(new Set());
        }
      }
    };

    document.addEventListener('keydown', handleEscapeForPopups);
    return () => document.removeEventListener('keydown', handleEscapeForPopups);
  }, [showForm, pins, openPopups]);

  // Mobile single popup policy enforcement
  useEffect(() => {
    if (isMobile && openPopups.size > 1) {

      // Keep only the most recently opened popup (last in the Set)
      const popupArray = Array.from(openPopups);
      const mostRecentPopupId = popupArray[popupArray.length - 1];
      
      pins.forEach(pin => {
        if (pin.id !== mostRecentPopupId && pin.marker && pin.marker.getPopup().isOpen()) {
          pin.marker.getPopup().remove();
        }
      });
    }
  }, [isMobile, openPopups, pins]);

  // Close display popups when edit form opens
  useEffect(() => {
    if (showForm && openPopups.size > 0) {
      closeAllPopups();
    }
  }, [showForm]);

  // Close edit form when display popup opens  
  useEffect(() => {
    if (!showForm && openPopups.size > 0) {
      // Display popup just opened, nothing to do
      return;
    }
    if (showForm && openPopups.size > 0) {
      // Both are open, close edit form (display popup takes priority)
      handleCloseForm();
    }
  }, [openPopups]);


  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPin(null);
    setHasChanges(false);
    setOriginalFormData(null);
    setFormData({
      title: '',
      note: '',
      visited_at: '',
      photo_url: '',
      photos: [],
      coordinates: null
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      
      // Check if any field has changed from original (using updated data)
      if (originalFormData) {
        const changed = Object.keys(updatedData).some(key => {
          if (key === 'photos' || key === 'coordinates') return false; // Skip comparison for complex objects
          const originalValue = originalFormData[key] || '';
          const currentValue = updatedData[key] || '';
          return originalValue !== currentValue;
        });
        setHasChanges(changed);
      }
      
      return updatedData;
    });
  };

  const closeAllPopups = () => {
    pins.forEach(pin => {
      if (pin.marker && pin.marker.getPopup().isOpen()) {
        pin.marker.getPopup().remove();
      }
    });
    setOpenPopups(new Set());
  };

  const handleEditPin = (pin) => {
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
    setFormData(originalData);
    setOriginalFormData(originalData);
    setHasChanges(false);
    setShowForm(true);
  };

  const handleDeletePin = (pin) => {
    // Store the pin for potential popup restoration
    setPendingDeletePin(pin);
    // Close all popups when opening delete modal
    closeAllPopups();
    setShowDeleteModal(true);
  };

  const confirmDeletePin = () => {
    if (pendingDeletePin) {
      // Remove marker from map
      if (pendingDeletePin.marker) {
        pendingDeletePin.marker.remove();
      }
      // Remove pin from state
      setPins(prevPins => prevPins.filter(p => p.id !== pendingDeletePin.id));
      // Remove from open popups tracking
      setOpenPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(pendingDeletePin.id);
        return newSet;
      });
    }
    setShowDeleteModal(false);
    setPendingDeletePin(null);
  };

  const cancelDeletePin = () => {
    setShowDeleteModal(false);
    
    // Restore the original popup after a brief delay
    if (pendingDeletePin && pendingDeletePin.marker) {
      setTimeout(() => {
        pendingDeletePin.marker.togglePopup();
      }, 200); // Small delay to ensure modal closes smoothly
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
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Fly to current location with smooth animation
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 14, // City-level zoom for current location
          duration: 2500
        });

        setIsLocating(false);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Unable to retrieve your location.');
            break;
        }
      },
      options
    );
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
    
    const popup = new mapboxgl.Popup(popupConfig).setHTML(`
      <div id="${popupId}" class="p-0 ${isMobile ? 'w-[85vw] max-w-sm' : 'min-w-80 max-w-md'} bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50">
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white ${isMobile ? 'px-4 py-4' : 'px-6 py-5'} relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div class="flex justify-between items-start relative z-10">
            <div class="flex-1 pr-4">
              <h3 class="m-0 ${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight leading-tight">${pin.title}</h3>
              ${pin.visited_at ? `
                <div class="mt-2 flex items-center gap-2 text-sm opacity-90">
                  <div class="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <span>${t('travel_pins.popup.visited')} ${formatDate(pin.visited_at)}</span>
                </div>
              ` : ''}
            </div>
            <button 
              onclick="window.closeTravelPinPopup(${pin.id})"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors duration-200 text-white/80 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-5'}">
          ${pin.note ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📝
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.travel_notes')}</h4>
              </div>
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
                ${renderMarkdownToHTML(pin.note)}
              </div>
            </div>
          ` : ''}

          ${pin.photo_url ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📷
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.photo')}</h4>
              </div>
              <div class="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-2">
                <div class="relative w-full" style="aspect-ratio: 16/10;">
                  <img
                    src="${pin.photo_url}"
                    alt="${pin.title}"
                    onclick="window.openTravelPinPhoto('${pin.photo_url}', '${pin.title}')"
                    class="absolute inset-0 w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div style="display: none;" class="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100 rounded-lg">
                    <div class="text-center">
                      <div class="text-2xl mb-2">📷</div>
                      <div class="text-sm">${t('travel_pins.popup.image_not_available')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          ${pin.photos && pin.photos.length > 0 ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📎
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">${t('travel_pins.popup.attachments')}</h4>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-50 border-2 border-dashed border-purple-200 rounded-xl p-4 text-center">
                <div class="text-2xl mb-2">📸</div>
                <div class="text-sm font-medium text-slate-600">
                  ${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''} attached
                </div>
              </div>
            </div>
          ` : ''}

          <div class="flex justify-center">
            <button
              onclick="window.copyTravelPinCoordinates('${pin.coordinates[0]}', '${pin.coordinates[1]}', ${pin.id})"
              id="copy-btn-${pin.id}"
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="text-sm font-medium">${t('travel_pins.popup.copy_location')}</span>
            </button>
          </div>

          <div class="pt-2 border-t border-slate-100">
            <div class="flex gap-2">
              <button 
                onclick="window.deleteTravelPin(${pin.id})"
                class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                ${t('travel_pins.popup.delete_button')}
              </button>
              <button 
                onclick="window.editTravelPin(${pin.id})"
                class="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium py-2.5 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                ${t('travel_pins.popup.edit_button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
    
    // Add event listeners to track popup state
    popup.on('open', () => {
      setOpenPopups(prev => new Set(prev).add(pin.id));

      // Improve mobile scrollability: stop events from reaching the map
      // and ensure the popup scroll container has momentum scrolling.
      try {
        const container = document.getElementById(popupId);
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

          const stop = (e) => e.stopPropagation();
          // Use passive listeners so scrolling is not blocked on iOS
          container.addEventListener('touchstart', stop, { passive: true });
          container.addEventListener('touchmove', stop, { passive: true });
          container.addEventListener('wheel', stop, { passive: true });
          container.addEventListener('pointerdown', stop, { passive: true });
        }

        // Disable map interactions while popup is open to avoid hijacking gestures
        if (map.current) {
          map.current.scrollZoom?.disable();
          map.current.boxZoom?.disable();
          map.current.dragRotate?.disable();
          map.current.dragPan?.disable();
          map.current.keyboard?.disable();
          map.current.doubleClickZoom?.disable();
          map.current.touchZoomRotate?.disable();
        }
      } catch (err) {
        console.warn('Failed to enhance popup scroll behavior:', err);
      }
    });
    
    popup.on('close', () => {
      setOpenPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(pin.id);
        return newSet;
      });

      // Re-enable map interactions after popup closes
      try {
        if (map.current) {
          map.current.scrollZoom?.enable();
          map.current.boxZoom?.enable();
          map.current.dragRotate?.enable();
          map.current.dragPan?.enable();
          map.current.keyboard?.enable();
          map.current.doubleClickZoom?.enable();
          map.current.touchZoomRotate?.enable();
        }
      } catch (err) {
        console.warn('Failed to restore map interactions:', err);
      }
    });
    
    return popup;
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.coordinates) return;

    const pinData = {
      id: editingPin ? editingPin.id : Date.now(),
      title: formData.title,
      note: formData.note,
      visited_at: formData.visited_at,
      photo_url: formData.photo_url,
      photos: formData.photos,
      coordinates: formData.coordinates
    };

    if (editingPin) {
      // Update existing pin
      setPins(prevPins => prevPins.map(pin => 
        pin.id === editingPin.id ? { ...pin, ...pinData, marker: pin.marker } : pin
      ));
      
      // Update the existing marker's popup
      const existingPin = pins.find(p => p.id === editingPin.id);
      if (existingPin && existingPin.marker) {
        existingPin.marker.setPopup(createEnhancedPopup(pinData));
      }
      
      handleCloseForm();
      return;
    }

    // Create new pin
    const newPin = pinData;

    // Add marker to map - Thumbtack design
    const el = document.createElement('div');
    el.className = 'travel-pin-marker';
    
    // Create thumbtack with alternating colors
    const colors = ['red', 'green', 'orange'];
    const selectedColor = colors[pins.length % colors.length];
    
    const colorSchemes = {
      red: {
        main: '#ef4444',
        dark: '#dc2626',
        light: '#f87171'
      },
      green: {
        main: '#10b981',
        dark: '#059669',
        light: '#34d399'
      },
      orange: {
        main: '#f97316',
        dark: '#ea580c',
        light: '#fb923c'
      }
    };
    
    const scheme = colorSchemes[selectedColor];
    
    el.innerHTML = `
      <div class="pushpin-container" style="position: relative; width: 100%; height: 100%;">
        <!-- Pin Head (top dome part) -->
        <div class="pin-head" style="
          width: 18px;
          height: 18px;
          background: radial-gradient(circle at 35% 30%, ${scheme.light}, ${scheme.main} 50%, ${scheme.dark} 90%);
          border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 
            0 3px 8px rgba(0,0,0,0.25),
            inset 0 1px 3px rgba(255,255,255,0.4),
            inset 0 -1px 2px rgba(0,0,0,0.2);
        ">
          <!-- Glossy highlight -->
          <div style="
            position: absolute;
            top: 2px;
            left: 5px;
            width: 5px;
            height: 5px;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
            filter: blur(0.5px);
          "></div>
        </div>
        
        <!-- Pin Base (wider middle section) -->
        <div class="pin-base" style="
          width: 12px;
          height: 4px;
          background: linear-gradient(to bottom, #888, #555);
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 6px 6px 2px 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
        
        <!-- Pin Shaft (thin needle) -->
        <div class="pin-shaft" style="
          width: 2px;
          height: 10px;
          background: linear-gradient(to right, #999 0%, #666 40%, #444 60%, #666 100%);
          position: absolute;
          top: 19px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 0 0 1px 1px;
          box-shadow: 
            1px 0 2px rgba(0,0,0,0.4),
            -1px 0 1px rgba(255,255,255,0.2);
        "></div>
        
        <!-- Shadow beneath the pin -->
        <div class="pin-shadow" style="
          width: 20px;
          height: 6px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
        "></div>
      </div>
    `;
    
    el.style.cssText = `
      width: 24px;
      height: 32px;
      cursor: pointer;
      position: relative;
      transition: width 0.2s ease, height 0.2s ease, filter 0.2s ease, margin 0.2s ease;
    `;

    // Add hover effects without using transform (which conflicts with Mapbox positioning)
    // With 'bottom' anchor, we need to adjust margins differently to keep the tip in the same position
    el.addEventListener('mouseenter', () => {
      el.style.filter = 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
      el.style.width = '28px';
      el.style.height = '36px';
      el.style.marginLeft = '-2px'; // Center the wider pin
      el.style.marginBottom = '-4px'; // Keep the bottom tip anchored
      el.style.zIndex = '1000';
    });

    el.addEventListener('mouseleave', () => {
      el.style.filter = 'brightness(1)';
      el.style.width = '24px';
      el.style.height = '32px';
      el.style.marginLeft = '0px';
      el.style.marginBottom = '0px';
      el.style.zIndex = 'auto';
    });

    const popup = createEnhancedPopup(newPin);

    // Add click event to show popup
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click event
      marker.togglePopup(); // Show the popup
    });

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' // Pin tip should anchor to the coordinates
    })
      .setLngLat(formData.coordinates)
      .setPopup(popup)
      .addTo(map.current);

    setPins(prev => [...prev, { ...newPin, marker }]);
    handleCloseForm();
  };

  return (
    <div className="w-full h-screen relative">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Background overlay for display modal (popup) */}
      {openPopups.size > 0 && !showForm && !showDeleteModal && !showEscModal && !showPhotoModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[950]"
          onClick={closeAllPopups}
        />
      )}


      {/* Enhanced Pin Creation/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[450px] max-w-[90vw] my-4 self-start"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Same gradient header as display modal */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight leading-tight m-0">
{editingPin ? t('travel_pins.form.edit_title') : t('travel_pins.form.add_title')}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs opacity-75">
                  {!hasChanges ? (
                    <span>{t('travel_pins.form.press_esc_to_close')}</span>
                  ) : (
                    <span>{t('travel_pins.form.unsaved_changes')}</span>
                  )}
                  <button 
                    onClick={handleCloseForm}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors duration-200 text-white/80 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Color-coded form sections */}
            <form onSubmit={handleSavePin} className="p-6 space-y-5">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📝
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.title_label')}</h4>
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '16px' }}
                  placeholder={t('travel_pins.form.title_placeholder')}
                />
              </div>

              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📖
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.travel_notes_label')}</h4>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
                  <textarea
                    rows={4}
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-slate-700 placeholder:text-slate-400"
                    style={{ fontSize: '16px' }}
                    placeholder={t('travel_pins.form.travel_notes_placeholder')}
                  />
                </div>
              </div>

              {/* Visit Date Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📅
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.visit_date_label')}</h4>
                </div>
                <div className="relative">
                  {/* Hidden native date input for functionality */}
                  <input
                    type="date"
                    value={formData.visited_at}
                    onChange={(e) => handleInputChange('visited_at', e.target.value)}
                    className="absolute opacity-0 pointer-events-none"
                    style={{ fontSize: '16px' }}
                    id="hidden-date-input"
                  />
                  {/* Custom display input that shows locale-formatted date */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.visited_at ? formatDate(formData.visited_at) : ''}
                      onClick={() => document.getElementById('hidden-date-input').showPicker?.() || document.getElementById('hidden-date-input').focus()}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                      style={{ fontSize: '16px' }}
                      placeholder={t('travel_pins.form.visit_date_placeholder')}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      📅
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo URL Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📷
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('travel_pins.form.photo_url_label')}</h4>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 rounded-xl p-4">
                  <input
                    type="url"
                    value={formData.photo_url || ''}
                    onChange={(e) => handleInputChange('photo_url', e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400"
                    style={{ fontSize: '16px' }}
                    placeholder={t('travel_pins.form.photo_url_placeholder')}
                  />
                  {formData.photo_url && (
                    <div className="mt-3 border-t border-pink-200 pt-3">
                      <div className="text-xs text-slate-500 mb-2">{t('travel_pins.form.photo_preview')}</div>
                      <div className="relative w-full" style={{aspectRatio: '16/10'}}>
                        <img
                          src={formData.photo_url}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{display: 'none'}} className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <div className="text-center">
                            <div className="text-lg mb-1">📷</div>
                            <div className="text-xs">{t('travel_pins.form.invalid_url')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinates Section */}
              {formData.coordinates && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                      🌍
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Location</h4>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">COORDINATES</div>
                        <div className="font-mono text-sm text-slate-800 font-semibold">
                          {formData.coordinates[1].toFixed(6)}, {formData.coordinates[0].toFixed(6)}
                        </div>
                      </div>
                      <div className="text-2xl">📍</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide"
                >
                  {t('travel_pins.form.cancel_button')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
                >
{editingPin ? t('travel_pins.form.update_button') : t('travel_pins.form.save_button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GPS Location Button */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 ${
          isLocating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1'
        }`}
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
        <div className="fixed bottom-24 right-6 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-xs">
          <div className="flex items-start gap-2">
            <div className="text-red-200">⚠️</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Location Error</div>
              <div className="text-xs text-red-100 mt-1">{locationError}</div>
            </div>
            <button 
              onClick={() => setLocationError(null)}
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[420px] max-w-[90vw] animate-scale-up">
            {/* Warning header with red gradient */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-6 py-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight leading-tight m-0">{t('travel_pins.delete_modal.title')}</h3>
                  <p className="text-sm opacity-90 mt-1">{t('travel_pins.delete_modal.subtitle')}</p>
                </div>
              </div>
            </div>
            
            {/* Modal content */}
            <div className="p-6 space-y-5">
              {/* Pin info section */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">
                      📍
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">{t('travel_pins.delete_modal.pin_to_delete')}</div>
                      <div className="text-lg font-semibold text-slate-900 break-words">
                        {pendingDeletePin?.title}
                      </div>
                      {pendingDeletePin?.note && (
                        <div className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {pendingDeletePin.note}
                        </div>
                      )}
                      {pendingDeletePin?.visited_at && (
                        <div className="text-xs text-slate-500 mt-2">
                          {t('travel_pins.popup.visited')} {formatDate(pendingDeletePin.visited_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Warning message */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                      💡
                    </div>
                    <div className="text-sm text-slate-700">
                      <div className="font-semibold mb-1">{t('travel_pins.delete_modal.confirmation_title')}</div>
                      <div>{t('travel_pins.delete_modal.confirmation_text')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelDeletePin}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 text-sm uppercase tracking-wide"
                >
                  {t('travel_pins.delete_modal.cancel_button')}
                </button>
                <button
                  onClick={confirmDeletePin}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
                >
                  {t('travel_pins.delete_modal.delete_forever_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
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
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={photoModalData.url}
              alt={photoModalData.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 2rem)'
              }}
            />
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors duration-200 backdrop-blur-sm border border-white/20"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-xl inline-block backdrop-blur-sm border border-white/20 max-w-md">
                <div className="font-medium">{photoModalData.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TravelPins;
