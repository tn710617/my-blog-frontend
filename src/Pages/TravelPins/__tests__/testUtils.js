// Test utilities for Travel Pins integration tests

import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { rest } from 'msw';

// Mock Mapbox GL JS
export const createMapboxMocks = () => {
  const mockEvents = {};
  const mockMarkers = [];
  const mockPopups = [];

  const mockMap = {
    // Map methods
    on: vi.fn((event, handler) => {
      if (!mockEvents[event]) mockEvents[event] = [];
      mockEvents[event].push(handler);
    }),
    off: vi.fn(),
    remove: vi.fn(),
    getZoom: vi.fn(() => 10),
    setZoom: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    flyTo: vi.fn(),
    project: vi.fn((lngLat) => ({ x: 100, y: 100 })),
    
    // Map interaction controls
    scrollZoom: { enable: vi.fn(), disable: vi.fn() },
    boxZoom: { enable: vi.fn(), disable: vi.fn() },
    dragRotate: { enable: vi.fn(), disable: vi.fn() },
    dragPan: { enable: vi.fn(), disable: vi.fn() },
    keyboard: { enable: vi.fn(), disable: vi.fn() },
    doubleClickZoom: { enable: vi.fn(), disable: vi.fn() },
    touchZoomRotate: { enable: vi.fn(), disable: vi.fn() },

    // Test helpers
    _triggerEvent: (event, data = {}) => {
      if (mockEvents[event]) {
        mockEvents[event].forEach(handler => handler(data));
      }
    },
    _getRegisteredEvents: () => Object.keys(mockEvents),
    _getMarkers: () => mockMarkers,
    _getPopups: () => mockPopups
  };

  const MockMarker = vi.fn().mockImplementation(function(options = {}) {
    const marker = {
      element: options.element || document.createElement('div'),
      coordinates: null,
      popup: null,
      
      setLngLat: vi.fn((coords) => {
        marker.coordinates = coords;
        return marker;
      }),
      
      addTo: vi.fn((map) => {
        mockMarkers.push(marker);
        return marker;
      }),
      
      remove: vi.fn(() => {
        const index = mockMarkers.indexOf(marker);
        if (index > -1) mockMarkers.splice(index, 1);
        return marker;
      }),
      
      setPopup: vi.fn((popup) => {
        marker.popup = popup;
        return marker;
      }),
      
      getPopup: vi.fn(() => marker.popup),
      
      togglePopup: vi.fn(() => {
        if (marker.popup) {
          if (marker.popup.isOpen()) {
            marker.popup.remove();
          } else {
            marker.popup.addTo(mockMap);
          }
        }
        return marker;
      }),

      getElement: vi.fn(() => marker.element)
    };
    
    return marker;
  });

  const MockPopup = vi.fn().mockImplementation(function(options = {}) {
    const popup = {
      options,
      isOpenState: false,
      html: '',
      events: {},
      
      setHTML: vi.fn((htmlContent) => {
        popup.html = htmlContent;
        return popup;
      }),
      
      addTo: vi.fn((map) => {
        popup.isOpenState = true;
        mockPopups.push(popup);
        // Trigger open event
        if (popup.events.open) {
          popup.events.open.forEach(handler => handler());
        }
        return popup;
      }),
      
      remove: vi.fn(() => {
        popup.isOpenState = false;
        const index = mockPopups.indexOf(popup);
        if (index > -1) mockPopups.splice(index, 1);
        // Trigger close event
        if (popup.events.close) {
          popup.events.close.forEach(handler => handler());
        }
        return popup;
      }),
      
      isOpen: vi.fn(() => popup.isOpenState),
      
      on: vi.fn((event, handler) => {
        if (!popup.events[event]) popup.events[event] = [];
        popup.events[event].push(handler);
      }),

      off: vi.fn()
    };
    
    return popup;
  });

  // Mock mapboxgl module
  const mapboxgl = {
    accessToken: '',
    Map: vi.fn().mockImplementation(() => mockMap),
    Marker: MockMarker,
    Popup: MockPopup
  };

  return { mapboxgl, mockMap, MockMarker, MockPopup };
};

// Test query client factory
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        cacheTime: 0,
        staleTime: 0
      },
      mutations: { retry: false }
    }
  });
};

// Test messages for i18n
export const testMessages = {
  // Mapbox messages
  'mapbox.scroll_zoom_blocker.ctrl_message': 'Use Ctrl + scroll to zoom the map',
  'mapbox.scroll_zoom_blocker.cmd_message': 'Use ⌘ + scroll to zoom the map', 
  'mapbox.touch_pan_blocker.message': 'Use two fingers to move the map',
  
  // Travel pins messages
  'travel_pins.form.add_title': 'Add Travel Pin',
  'travel_pins.form.edit_title': 'Edit Travel Pin',
  'travel_pins.form.title_label': 'TITLE',
  'travel_pins.form.title_placeholder': 'Enter pin title...',
  'travel_pins.form.travel_notes_label': 'TRAVEL NOTES',
  'travel_pins.form.travel_notes_placeholder': 'Share your memories...',
  'travel_pins.form.visit_date_label': 'VISIT DATE',
  'travel_pins.form.visit_date_placeholder': 'Select date',
  'travel_pins.form.photo_url_label': 'PHOTO URL',
  'travel_pins.form.photo_url_placeholder': 'https://...',
  'travel_pins.form.photo_preview': 'Preview',
  'travel_pins.form.invalid_url': 'Invalid URL',
  'travel_pins.form.cancel_button': 'CANCEL',
  'travel_pins.form.save_button': 'SAVE',
  'travel_pins.form.update_button': 'UPDATE',
  'travel_pins.form.press_esc_to_close': 'Press ESC to close',
  'travel_pins.form.unsaved_changes': 'Unsaved changes',
  
  // Popup messages
  'travel_pins.popup.visited': 'Visited on',
  'travel_pins.popup.travel_notes': 'TRAVEL NOTES',
  'travel_pins.popup.photo': 'PHOTO',
  'travel_pins.popup.attachments': 'ATTACHMENTS',
  'travel_pins.popup.copy_location': 'Copy Location',
  'travel_pins.popup.copied': 'Copied!',
  'travel_pins.popup.edit_button': 'EDIT',
  'travel_pins.popup.delete_button': 'DELETE',
  'travel_pins.popup.image_not_available': 'Image not available',
  
  // Delete modal messages
  'travel_pins.delete_modal.title': 'Delete Travel Pin',
  'travel_pins.delete_modal.subtitle': 'This action cannot be undone',
  'travel_pins.delete_modal.pin_to_delete': 'PIN TO DELETE',
  'travel_pins.delete_modal.confirmation_title': 'Are you sure?',
  'travel_pins.delete_modal.confirmation_text': 'This will permanently delete this travel pin and all associated data.',
  'travel_pins.delete_modal.cancel_button': 'CANCEL',
  'travel_pins.delete_modal.delete_forever_button': 'DELETE FOREVER'
};

// MSW API handlers
export const createTravelPinsHandlers = () => {
  const mockPins = [
    {
      id: 1,
      title: 'Test Pin 1',
      note: 'Test note 1',
      latitude: '25.0336',
      longitude: '121.5645',
      visited_at: '2024-03-15',
      photo_url: 'https://example.com/photo1.jpg',
      created_at: '2024-03-15T10:30:00.000000Z',
      updated_at: '2024-03-15T10:30:00.000000Z'
    },
    {
      id: 2, 
      title: 'Test Pin 2',
      note: null,
      latitude: '40.7128',
      longitude: '-74.0060',
      visited_at: null,
      photo_url: null,
      created_at: '2024-03-20T15:45:00.000000Z', 
      updated_at: '2024-03-20T15:45:00.000000Z'
    }
  ];

  return [
    // GET /travel-pins - List all pins
    rest.get('/api/travel-pins', (req, res, ctx) => {
      return res(
        ctx.json({
          data: mockPins
        })
      );
    }),

    // GET /travel-pins/:id - Get single pin
    rest.get('/api/travel-pins/:id', (req, res, ctx) => {
      const { id } = req.params;
      const pin = mockPins.find(p => p.id === parseInt(id));
      
      if (!pin) {
        return res(
          ctx.status(404),
          ctx.json({ message: 'Travel pin not found' })
        );
      }
      
      return res(ctx.json({ data: pin }));
    }),

    // POST /travel-pins - Create new pin
    rest.post('/api/travel-pins', (req, res, ctx) => {
      const newPin = {
        id: mockPins.length + 1,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockPins.push(newPin);
      return res(ctx.json({ data: newPin }));
    }),

    // PUT /travel-pins/:id - Update pin
    rest.put('/api/travel-pins/:id', (req, res, ctx) => {
      const { id } = req.params;
      const pinIndex = mockPins.findIndex(p => p.id === parseInt(id));
      
      if (pinIndex === -1) {
        return res(
          ctx.status(404),
          ctx.json({ message: 'Travel pin not found' })
        );
      }
      
      const updatedPin = {
        ...mockPins[pinIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      
      mockPins[pinIndex] = updatedPin;
      return res(ctx.json({ data: updatedPin }));
    }),

    // DELETE /travel-pins/:id - Delete pin  
    rest.delete('/api/travel-pins/:id', (req, res, ctx) => {
      const { id } = req.params;
      const pinIndex = mockPins.findIndex(p => p.id === parseInt(id));
      
      if (pinIndex === -1) {
        return res(
          ctx.status(404), 
          ctx.json({ message: 'Travel pin not found' })
        );
      }
      
      mockPins.splice(pinIndex, 1);
      return res(ctx.status(204));
    })
  ];
};

// Mock DOM globals for testing
export const setupDOMGlobals = () => {
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve())
    }
  });

  // Mock geolocation API
  Object.assign(navigator, {
    geolocation: {
      getCurrentPosition: vi.fn()
    }
  });

  // Mock window.innerWidth for mobile detection
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));

  // Mock custom events
  window.addEventListener = vi.fn();
  window.removeEventListener = vi.fn();
  
  // Mock document methods
  document.getElementById = vi.fn();
  document.createElement = vi.fn(() => ({
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    },
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }));
};

// Test data factories
export const createTestPin = (overrides = {}) => ({
  id: 1,
  title: 'Test Pin',
  note: 'Test note',
  coordinates: [121.5645, 25.0336],
  visited_at: '2024-03-15',
  photo_url: 'https://example.com/photo.jpg',
  created_at: '2024-03-15T10:30:00.000000Z',
  updated_at: '2024-03-15T10:30:00.000000Z',
  ...overrides
});

export const createTestFormData = (overrides = {}) => ({
  title: '',
  note: '',
  visited_at: '',
  photo_url: '',
  photos: [],
  coordinates: null,
  ...overrides
});