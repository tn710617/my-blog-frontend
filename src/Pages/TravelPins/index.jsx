import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TravelPins = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [pins, setPins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    links: '',
    visited_at: '',
    photos: [],
    coordinates: null
  });

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
        setFormData(prev => ({
          ...prev,
          title: '',
          note: '',
          links: '',
          visited_at: '',
          photos: [],
          coordinates
        }));
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

  const handleSavePin = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.coordinates) return;

    const newPin = {
      id: Date.now(),
      title: formData.title,
      note: formData.note,
      links: formData.links.split(',').map(link => link.trim()).filter(Boolean),
      visited_at: formData.visited_at,
      photos: formData.photos,
      coordinates: formData.coordinates
    };

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

    const popup = new mapboxgl.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(`
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">${newPin.title}</h3>
        ${newPin.note ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563; line-height: 1.4;">${newPin.note}</p>` : ''}
        ${newPin.visited_at ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;"><strong>Visited:</strong> ${newPin.visited_at}</p>` : ''}
        ${newPin.links && newPin.links.length > 0 ? `
          <div style="margin-top: 8px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #374151;">Links:</p>
            ${newPin.links.map(link => `<a href="${link}" target="_blank" rel="noopener" style="display: block; font-size: 11px; color: #3b82f6; text-decoration: underline; margin: 2px 0;">${link.length > 30 ? link.substring(0, 30) + '...' : link}</a>`).join('')}
          </div>
        ` : ''}
        ${newPin.photos && newPin.photos.length > 0 ? `
          <div style="margin-top: 8px;">
            <p style="font-size: 11px; color: #6b7280;"><strong>${newPin.photos.length} photo(s) attached</strong></p>
          </div>
        ` : ''}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 10px; color: #9ca3af; margin: 0;">📍 ${newPin.coordinates[1].toFixed(4)}, ${newPin.coordinates[0].toFixed(4)}</p>
        </div>
      </div>
    `);

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
    setShowForm(false);
    setFormData({
      title: '',
      note: '',
      links: '',
      visited_at: '',
      photos: [],
      coordinates: null
    });
  };

  return (
    <div className="w-full h-screen relative">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Pin Creation Form */}
      {showForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Add Travel Pin</h3>
            
            <form onSubmit={handleSavePin} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a title for this location"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your thoughts about this place..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.visited_at}
                  onChange={(e) => setFormData({ ...formData, visited_at: e.target.value })}
                />
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Links
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter URLs separated by commas"
                  value={formData.links}
                  onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                />
              </div>

              {/* Coordinates Display */}
              {formData.coordinates && (
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Coordinates:</strong> {formData.coordinates[0].toFixed(5)}, {formData.coordinates[1].toFixed(5)}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Pin
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