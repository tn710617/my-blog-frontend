import React, { useEffect, useRef, useState } from 'react';
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

    window.closeTravelPinPopup = (pinId) => {
      const pin = pins.find(p => p.id === pinId);
      if (pin && pin.marker) {
        pin.marker.getPopup().remove();
        // State tracking is handled by popup 'close' event listener
      }
    };

    return () => {
      delete window.editTravelPin;
      delete window.closeTravelPinPopup;
    };
  }, [pins]);

  // ESC key handler for form modal
  useEffect(() => {
    if (!showForm) return;

    const handleEscape = (e) => {
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
  }, [showForm, pins, openPopups]);

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

  const handleEditPin = (pin) => {
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

  const createEnhancedPopup = (pin) => {
    const popupId = `popup-${pin.id}`;
    const popup = new mapboxgl.Popup({ 
      offset: 25,
      closeButton: false,
      closeOnClick: false,
      className: 'travel-pin-popup',
      maxWidth: 'none'
    }).setHTML(`
      <div id="${popupId}" class="p-0 min-w-80 max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50">
        <!-- Header with elegant gradient -->
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-5 relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div class="flex justify-between items-start relative z-10">
            <div class="flex-1 pr-4">
              <h3 class="m-0 text-xl font-bold tracking-tight leading-tight">${pin.title}</h3>
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

        <!-- Content with improved spacing and typography -->
        <div class="p-6 space-y-5">
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

          <!-- Enhanced Coordinates Section -->
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

          <!-- Enhanced Edit Button -->
          <div class="pt-2 border-t border-slate-100">
            <button 
              onclick="window.editTravelPin(${pin.id})"
              class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm uppercase tracking-wide"
            >
              <span class="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Travel Pin
              </span>
            </button>
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

    // Add marker to map - proper approach without transform conflicts
    const el = document.createElement('div');
    el.className = 'travel-pin-marker';
    el.style.cssText = `
      background-color: #ef4444;
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: background-color 0.2s ease, box-shadow 0.2s ease, width 0.2s ease, height 0.2s ease;
      position: relative;
    `;

    // Add hover effects without using transform (which conflicts with Mapbox positioning)
    el.addEventListener('mouseenter', () => {
      el.style.backgroundColor = '#dc2626';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.marginTop = '-2px';
      el.style.marginLeft = '-2px';
    });

    el.addEventListener('mouseleave', () => {
      el.style.backgroundColor = '#ef4444';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.marginTop = '0px';
      el.style.marginLeft = '0px';
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

      {/* Debug/Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg max-w-sm">
        <h2 className="font-semibold text-lg mb-2">🗺️ Travel Pins</h2>
        
        {/* Debug Info */}
        <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
          <div><strong>Token:</strong> {token.substring(0, 20)}...</div>
          <div><strong>Map Loaded:</strong> {mapLoaded ? '✅ Yes' : '❌ No'}</div>
          {mapError && <div className="text-red-600"><strong>Error:</strong> {mapError}</div>}
        </div>
        
        <p className="text-sm text-gray-700 mb-2">
          Click anywhere on the map to add a travel pin with your memories!
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag to move the map</li>
          <li>• Scroll to zoom in/out</li>
          <li>• <strong>Hover pins</strong> to see size animation</li>
          <li>• <strong>Click pins</strong> to view saved details</li>
          <li>• <strong>Click empty areas</strong> to add new pins</li>
        </ul>
        {pins.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              {pins.length} pin{pins.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPins;