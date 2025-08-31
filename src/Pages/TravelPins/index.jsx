import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMarkdown from 'react-markdown';

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
  }
  
  .travel-pin-popup-center .mapboxgl-popup-content {
    position: relative !important;
    transform: none !important;
  }
  
  .travel-pin-popup-center .mapboxgl-popup-tip {
    display: none !important;
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
    photos: [],
    coordinates: null
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [openPopups, setOpenPopups] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchEscHandled = useRef(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

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
      console.log('Screen size changed, isMobile:', newIsMobile);
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
      console.log('Significant zoom detected - closing all popups');
      console.log('Current pins count:', pins.length);
      
      let closedCount = 0;
      
      // Method 1: Close popups using pins state
      pins.forEach((pin, index) => {
        if (pin.marker && pin.marker.getPopup()) {
          const popup = pin.marker.getPopup();
          if (popup.isOpen()) {
            console.log(`Closing popup for pin ${index}:`, pin.title);
            popup.remove();
            closedCount++;
          }
        }
      });
      
      // Method 2: Fallback - close any remaining popups via DOM
      const remainingPopups = document.querySelectorAll('.mapboxgl-popup');
      if (remainingPopups.length > 0) {
        console.log(`Found ${remainingPopups.length} remaining popups, closing via DOM`);
        remainingPopups.forEach(popup => {
          if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
        });
      }
      
      console.log(`Closed ${closedCount} popups via pins state`);
      hasClosedPopups = true;
    };

    const handleZoomStart = () => {
      zoomStartLevel = map.current.getZoom();
      hasClosedPopups = false;
      console.log('Zoom started at level:', zoomStartLevel.toFixed(2));
      
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
        
        console.log('Zoom difference:', zoomDifference.toFixed(3));
        
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
        console.log('Zoom ended - resetting tracking');
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
    console.log('Environment token:', import.meta.env.VITE_MAPBOX_TOKEN);
    console.log('Using token:', mapboxToken);
    setToken(mapboxToken);
    
    mapboxgl.accessToken = mapboxToken;

    if (map.current) return; // Initialize map only once

    console.log('Initializing map with container:', mapContainer.current);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 2
      });

      console.log('Map instance created');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
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
        
        console.log('Map clicked at:', e.lngLat);
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        const newFormData = {
          title: '',
          note: '',
          visited_at: '',
          photos: [],
          coordinates
        };
        console.log('New pin creation with formData:', newFormData);
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        setHasChanges(false);
        console.log('Setting hasChanges to false for new pin');
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

    return () => {
      delete window.editTravelPin;
      delete window.deleteTravelPin;
      delete window.closeTravelPinPopup;
    };
  }, [pins]);

  // ESC key handler for form modal
  useEffect(() => {
    if (!showForm) return;

    const handleEscape = (e) => {
      // Don't handle ESC if search box is focused
      if (document.activeElement?.id === 'location-search-input') return;
      
      console.log('Key pressed:', e.key, 'hasChanges:', hasChanges);
      if (e.key === 'Escape') {
        console.log('ESC pressed, hasChanges:', hasChanges);
        if (!hasChanges) {
          // No changes made, close immediately
          console.log('No changes, closing form');
          handleCloseForm();
        } else {
          // Has changes, show confirmation dialog
          console.log('Has changes, showing confirmation');
          const confirmClose = window.confirm(
            'You have unsaved changes. Are you sure you want to close?'
          );
          if (confirmClose) {
            handleCloseForm();
          }
        }
      }
    };

    console.log('Adding ESC event listener, showForm:', showForm, 'hasChanges:', hasChanges);
    document.addEventListener('keydown', handleEscape);
    return () => {
      console.log('Removing ESC event listener');
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showForm, hasChanges]);

  // ESC key handler for closing display popups (when form is not open)
  useEffect(() => {
    if (showForm) return; // Don't handle ESC when form is open

    const handleEscapeForPopups = (e) => {
      const activeElementId = document.activeElement?.id;
      console.log('Global popup ESC handler - activeElement:', activeElementId, 'isSearchFocused:', isSearchFocused, 'searchEscHandled:', searchEscHandled.current);
      
      // Don't handle ESC if search already handled it
      if (searchEscHandled.current) {
        console.log('Search ESC already handled, skipping popup ESC handler');
        return;
      }
      
      // Don't handle ESC if search box is focused (using reliable state)
      if (isSearchFocused) {
        console.log('Search box is focused (via state), skipping popup ESC handler');
        return;
      }
      
      if (e.key === 'Escape') {
        console.log('ESC pressed for popups, openPopups size:', openPopups.size);
        if (openPopups.size > 0) {
          // Close all open popups
          pins.forEach(pin => {
            if (pin.marker && pin.marker.getPopup().isOpen()) {
              console.log('Closing popup for pin:', pin.title);
              pin.marker.getPopup().remove();
            }
          });
          setOpenPopups(new Set());
        }
      }
    };

    document.addEventListener('keydown', handleEscapeForPopups);
    return () => document.removeEventListener('keydown', handleEscapeForPopups);
  }, [showForm, pins, openPopups, isSearchFocused]);

  // Mobile single popup policy enforcement
  useEffect(() => {
    if (isMobile && openPopups.size > 1) {
      console.log('Mobile single popup policy: closing extra popups. Current open:', openPopups.size);
      
      // Keep only the most recently opened popup (last in the Set)
      const popupArray = Array.from(openPopups);
      const mostRecentPopupId = popupArray[popupArray.length - 1];
      
      pins.forEach(pin => {
        if (pin.id !== mostRecentPopupId && pin.marker && pin.marker.getPopup().isOpen()) {
          console.log('Mobile policy: closing popup for pin:', pin.title);
          pin.marker.getPopup().remove();
        }
      });
    }
  }, [isMobile, openPopups, pins]);

  // Close display popups when edit form opens
  useEffect(() => {
    if (showForm && openPopups.size > 0) {
      console.log('Edit form opened, closing all display popups');
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
      console.log('Display popup opened while edit form was open, closing edit form');
      handleCloseForm();
    }
  }, [openPopups]);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('location-search-input')?.focus();
        console.log('Search shortcut activated (Ctrl/Cmd + F)');
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPin(null);
    setHasChanges(false);
    setOriginalFormData(null);
    setFormData({
      title: '',
      note: '',
      visited_at: '',
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
    console.log('Closing all popups, current count:', openPopups.size);
    pins.forEach(pin => {
      if (pin.marker && pin.marker.getPopup().isOpen()) {
        console.log('Closing popup for pin:', pin.title);
        pin.marker.getPopup().remove();
      }
    });
    setOpenPopups(new Set());
  };

  const handleEditPin = (pin) => {
    // Close all display popups when opening edit form
    console.log('Opening edit form, closing all display popups');
    closeAllPopups();
    
    const originalData = {
      title: pin.title,
      note: pin.note || '',
      visited_at: pin.visited_at || '',
      photos: pin.photos || [],
      coordinates: pin.coordinates
    };
    
    console.log('handleEditPin called with originalData:', originalData);
    setEditingPin(pin);
    setFormData(originalData);
    setOriginalFormData(originalData);
    setHasChanges(false);
    console.log('Setting hasChanges to false');
    setShowForm(true);
  };

  const handleDeletePin = (pin) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the pin "${pin.title}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      console.log('Deleting pin:', pin.title);
      // Remove marker from map
      if (pin.marker) {
        pin.marker.remove();
      }
      // Remove pin from state
      setPins(prevPins => prevPins.filter(p => p.id !== pin.id));
      // Remove from open popups tracking
      setOpenPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(pin.id);
        return newSet;
      });
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
        console.log('Search results:', data.features?.length || 0, 'results for:', query);
        console.log('Setting showSuggestions to true');
      } catch (error) {
        console.error('Geocoding error:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1); // Reset selection when typing
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    console.log('Search input key pressed:', e.key, 'showSuggestions:', showSuggestions);
    
    if (e.key === 'Escape') {
      console.log('ESC pressed in search input, closing suggestions');
      e.preventDefault();
      e.stopPropagation();
      searchEscHandled.current = true;
      setShowSuggestions(false);
      setSelectedIndex(-1);
      console.log('Set showSuggestions to false');
      
      // Reset the flag after a short delay
      setTimeout(() => {
        searchEscHandled.current = false;
      }, 10);
      return;
    }

    if (!showSuggestions) return;

    const currentResults = searchSuggestions.length > 0 ? searchSuggestions : searchHistory;
    const maxIndex = currentResults.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
        console.log('Arrow down, selectedIndex will be:', selectedIndex < maxIndex ? selectedIndex + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
        console.log('Arrow up, selectedIndex will be:', selectedIndex > 0 ? selectedIndex - 1 : maxIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
          const selected = currentResults[selectedIndex];
          console.log('Enter pressed, selecting:', selected);
          if (searchSuggestions.length > 0) {
            // It's a search result
            handleLocationSelect(selected);
          } else {
            // It's a history item
            handleLocationSelect({
              center: selected.coordinates,
              place_name: selected.name,
              properties: { accuracy: 'point' }
            });
          }
        }
        break;
      default:
        break;
    }
  };

  // Navigate to selected location
  const handleLocationSelect = (location) => {
    const [lng, lat] = location.center;
    
    // Fly to location with smooth animation (country-level zoom)
    map.current.flyTo({
      center: [lng, lat],
      zoom: 5, // Country-level zoom
      duration: 2000
    });

    // Add to search history
    const historyItem = {
      id: Date.now(),
      name: location.place_name,
      coordinates: [lng, lat],
      timestamp: new Date()
    };
    
    setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5
    
    // Clear search
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    console.log('Navigated to:', location.place_name);
  };

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
        console.log('Current location:', { latitude, longitude });

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
                  <span>Visited ${new Date(pin.visited_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
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
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Travel Notes</h4>
              </div>
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
                ${renderMarkdownToHTML(pin.note)}
              </div>
            </div>
          ` : ''}

          ${pin.photos && pin.photos.length > 0 ? `
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📷
                </div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Photos</h4>
              </div>
              <div class="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-dashed border-pink-200 rounded-xl p-4 text-center">
                <div class="text-2xl mb-2">📸</div>
                <div class="text-sm font-medium text-slate-600">
                  ${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''} attached
                </div>
              </div>
            </div>
          ` : ''}

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                🌍
              </div>
              <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Location</h4>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-slate-500 font-medium mb-1">COORDINATES</div>
                  <div class="font-mono text-sm text-slate-800 font-semibold">
                    ${pin.coordinates[1].toFixed(6)}, ${pin.coordinates[0].toFixed(6)}
                  </div>
                </div>
                <div class="text-2xl">📍</div>
              </div>
            </div>
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
                Delete
              </button>
              <button 
                onclick="window.editTravelPin(${pin.id})"
                class="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium py-2.5 px-3 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
    
    // Add event listeners to track popup state
    popup.on('open', () => {
      console.log('Popup opened for pin:', pin.title);
      setOpenPopups(prev => new Set(prev).add(pin.id));
    });
    
    popup.on('close', () => {
      console.log('Popup closed for pin:', pin.title);
      setOpenPopups(prev => {
        const newSet = new Set(prev);
        newSet.delete(pin.id);
        return newSet;
      });
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
    el.addEventListener('mouseenter', () => {
      el.style.filter = 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
      el.style.width = '28px';
      el.style.height = '36px';
      el.style.marginTop = '-2px';
      el.style.marginLeft = '-2px';
      el.style.zIndex = '1000';
    });

    el.addEventListener('mouseleave', () => {
      el.style.filter = 'brightness(1)';
      el.style.width = '24px';
      el.style.height = '32px';
      el.style.marginTop = '0px';
      el.style.marginLeft = '0px';
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
      anchor: 'center' // This prevents position jumping
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

      {/* Search Box Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw] z-10">
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <input
              id="location-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                console.log('Search input focused');
                setIsSearchFocused(true);
                setShowSuggestions(searchSuggestions.length > 0 || searchHistory.length > 0);
              }}
              onBlur={() => {
                console.log('Search input blurred');
                setIsSearchFocused(false);
                // Only hide suggestions if not hidden by ESC already
                if (showSuggestions) {
                  // Delay hiding suggestions to allow for clicks on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }
              }}
              placeholder="Search countries... (Ctrl/Cmd + F)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {isSearching ? (
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
              
              {/* Search Results */}
              {searchSuggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Countries
                  </div>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-50 last:border-b-0 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          📍
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.text}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {suggestion.place_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && searchSuggestions.length === 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 flex justify-between items-center">
                    Recent Searches
                    <button 
                      onClick={() => setSearchHistory([])}
                      className="text-blue-500 hover:text-blue-700 text-xs font-normal normal-case"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleLocationSelect({
                        center: item.coordinates,
                        place_name: item.name,
                        properties: { accuracy: 'point' }
                      })}
                      className={`w-full px-4 py-3 text-left border-b border-gray-50 last:border-b-0 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          🕒
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Pin Creation/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 w-[450px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Same gradient header as display modal */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight leading-tight m-0">
                    {editingPin ? '✏️ Edit Travel Pin' : '📍 Add Travel Pin'}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs opacity-75">
                  {!hasChanges ? (
                    <span>Press ESC to close</span>
                  ) : (
                    <span>⚠️ Unsaved changes</span>
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
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Title *</h4>
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a title for this location"
                />
              </div>

              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📖
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Travel Notes</h4>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
                  <textarea
                    rows={4}
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-slate-700 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Visit Date Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                    📅
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Visit Date</h4>
                </div>
                <input
                  type="date"
                  value={formData.visited_at}
                  onChange={(e) => handleInputChange('visited_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
                >
                  {editingPin ? 'Update Pin' : 'Save Pin'}
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

    </div>
  );
};

export default TravelPins;