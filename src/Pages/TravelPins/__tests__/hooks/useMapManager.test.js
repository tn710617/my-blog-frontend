import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useMapManager } from '../../hooks/useMapManager';

// Mock mapbox-gl - restructure to avoid hoisting issues
const mockMap = {
  on: vi.fn(),
  off: vi.fn(),
  remove: vi.fn(),
  flyTo: vi.fn(),
  getZoom: vi.fn(() => 5),
  loaded: vi.fn(() => true), // Add loaded method that returns true
  _tpHandlers: null,
  _tpZoomHandlers: null,
  _tpMapClickHandler: null
};

vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(() => mockMap)
  }
}));

describe('useMapManager', () => {
  let mockOnMapClick;
  let mockOnMapLoad; 
  let mockOnRecolorMarkers;

  beforeEach(async () => {
    mockOnMapClick = vi.fn();
    mockOnMapLoad = vi.fn();
    mockOnRecolorMarkers = vi.fn();

    // Reset all mocks
    vi.clearAllMocks();
    mockMap.on.mockClear();
    mockMap.off.mockClear();
    mockMap.remove.mockClear();
    mockMap.flyTo.mockClear();
    mockMap.getZoom.mockReturnValue(5);
    mockMap.loaded.mockReturnValue(true);
    mockMap._tpHandlers = null;
    mockMap._tpZoomHandlers = null;
    mockMap._tpMapClickHandler = null;

    // Reset mapboxgl mock - get the mock instance
    const mapboxglModule = await import('mapbox-gl');
    const mockMapboxgl = mapboxglModule.default;
    mockMapboxgl.accessToken = '';
    mockMapboxgl.Map.mockClear();

    // Mock DOM element for map container  
    const mockContainer = document.createElement('div');
    mockContainer.id = 'map-container';
    
    // Mock the mapContainer ref to return the mock element
    vi.spyOn(React, 'useRef').mockImplementation((initialValue) => {
      if (initialValue === null) {
        return { current: mockContainer };
      }
      return { current: initialValue || new Map() };
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(result.current.map).toBe(null); // Map is initialized asynchronously
      expect(result.current.mapLoaded).toBe(false);
      expect(result.current.mapError).toBe(null);
      expect(result.current.mapContainer).toBeDefined();
      expect(result.current.markersRef).toBeDefined();
      expect(result.current.markersByIdRef).toBeDefined();
      expect(typeof result.current.flyTo).toBe('function');
      expect(typeof result.current.getZoom).toBe('function');
      expect(typeof result.current.addZoomHandlers).toBe('function');
      expect(typeof result.current.cleanup).toBe('function');
    });

    it('should not initialize map without token', async () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: '',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mapboxglModule = await import('mapbox-gl');
      const mockMapboxgl = mapboxglModule.default;
      expect(mockMapboxgl.Map).not.toHaveBeenCalled();
    });

    it('should initialize map with token', async () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mapboxglModule = await import('mapbox-gl');
      const mockMapboxgl = mapboxglModule.default;
      expect(mockMapboxgl.accessToken).toBe('test-token');
      const mapCall = mockMapboxgl.Map.mock.calls[0][0];
      expect(mapCall).toEqual(expect.objectContaining({
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 2,
        attributionControl: false,
        logoPosition: 'bottom-right'
      }));
      // Center can be [0,0] for desktop or [0,-15] for mobile
      expect(mapCall.center).toEqual(expect.arrayContaining([0, expect.any(Number)]));
    });

    it('should handle map initialization error', async () => {
      const mapboxglModule = await import('mapbox-gl');
      const mockMapboxgl = mapboxglModule.default;
      
      const error = new Error('Map initialization failed');
      mockMapboxgl.Map.mockImplementation(() => { throw error; });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create map:', error);
      expect(result.current.mapError).toBe('Map initialization failed');
      
      consoleErrorSpy.mockRestore();
    });

    it('should prevent multiple map initialization', async () => {
      const { rerender } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mapboxglModule = await import('mapbox-gl');
      const mockMapboxgl = mapboxglModule.default;
      expect(mockMapboxgl.Map).toHaveBeenCalledTimes(1);

      // Rerender should not create another map
      rerender();
      expect(mockMapboxgl.Map).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handlers', () => {
    it('should register load event handler', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(mockMap.on).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('should handle map load event', async () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Simulate load event
      const loadHandler = mockMap.on.mock.calls.find(call => call[0] === 'load')[1];
      await act(async () => {
        loadHandler();
        // Wait for the setTimeout to complete
        await new Promise(resolve => setTimeout(resolve, 1));
      });

      expect(result.current.mapLoaded).toBe(true);
      expect(mockOnMapLoad).toHaveBeenCalledTimes(1);
    });

    it('should handle map error event', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Simulate error event
      const errorHandler = mockMap.on.mock.calls.find(call => call[0] === 'error')[1];
      const error = { error: { message: 'Network error' } };
      
      act(() => {
        errorHandler(error);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Map error:', error);
      expect(result.current.mapError).toBe('Network error');
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error event without specific message', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Simulate error event without specific message
      const errorHandler = mockMap.on.mock.calls.find(call => call[0] === 'error')[1];
      const error = {};
      
      act(() => {
        errorHandler(error);
      });

      expect(result.current.mapError).toBe('Map failed to load');
      
      consoleErrorSpy.mockRestore();
    });

    it('should register move and zoom end handlers when onRecolorMarkers provided', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('zoomend', expect.any(Function));
    });

    it('should call onRecolorMarkers on move end', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const moveEndHandler = mockMap.on.mock.calls.find(call => call[0] === 'moveend')[1];
      act(() => {
        moveEndHandler();
      });

      expect(mockOnRecolorMarkers).toHaveBeenCalledTimes(1);
    });

    it('should handle onRecolorMarkers errors gracefully', () => {
      const errorOnRecolorMarkers = vi.fn(() => { throw new Error('Recolor failed'); });
      
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: errorOnRecolorMarkers
      }));

      const moveEndHandler = mockMap.on.mock.calls.find(call => call[0] === 'moveend')[1];
      act(() => {
        moveEndHandler();
      });

      // Verify error callback was called and hook continues to work
      expect(errorOnRecolorMarkers).toHaveBeenCalledTimes(1);
    });

    it('should register click handler when onMapClick provided', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(mockMap.on).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle map click on empty area', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const clickHandler = mockMap.on.mock.calls.find(call => call[0] === 'click')[1];
      const clickEvent = {
        lngLat: [0, 0],
        originalEvent: {
          target: {
            closest: vi.fn(() => null),
            classList: { contains: vi.fn(() => false) }
          }
        }
      };

      act(() => {
        clickHandler(clickEvent);
      });

      expect(mockOnMapClick).toHaveBeenCalledWith([0, 0]);
    });

    it('should not handle map click on pin marker', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const clickHandler = mockMap.on.mock.calls.find(call => call[0] === 'click')[1];
      const clickEvent = {
        lngLat: [0, 0],
        originalEvent: {
          target: {
            closest: vi.fn(() => ({})), // Simulate marker element found
            classList: { contains: vi.fn(() => false) }
          }
        }
      };

      act(() => {
        clickHandler(clickEvent);
      });

      expect(mockOnMapClick).not.toHaveBeenCalled();
    });
  });

  describe('flyTo functionality', () => {
    it('should call map flyTo with correct parameters', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      act(() => {
        result.current.flyTo([1, 2], 15, 3000);
      });

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [1, 2],
        zoom: 15,
        duration: 3000
      });
    });

    it('should use default zoom and duration', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      act(() => {
        result.current.flyTo([1, 2]);
      });

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [1, 2],
        zoom: 10,
        duration: 2500
      });
    });

    it('should handle flyTo when map not initialized', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: '',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(() => {
        act(() => {
          result.current.flyTo([1, 2]);
        });
      }).not.toThrow();

      expect(mockMap.flyTo).not.toHaveBeenCalled();
    });
  });

  describe('getZoom functionality', () => {
    it('should return current zoom level', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const zoom = result.current.getZoom();
      expect(zoom).toBe(5);
      expect(mockMap.getZoom).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when map not initialized', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: '',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const zoom = result.current.getZoom();
      expect(zoom).toBe(0);
    });
  });

  describe('zoom handlers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add zoom event handlers', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mockCloseAllPopups = vi.fn();
      let cleanup;

      act(() => {
        cleanup = result.current.addZoomHandlers(mockCloseAllPopups);
      });

      expect(mockMap.on).toHaveBeenCalledWith('zoomstart', expect.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('zoom', expect.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('zoomend', expect.any(Function));
      expect(typeof cleanup).toBe('function');
    });

    it('should close popups on significant zoom change', () => {
      mockMap.getZoom.mockReturnValueOnce(5).mockReturnValueOnce(6); // Start at 5, end at 6 (diff = 1)
      
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mockCloseAllPopups = vi.fn();

      act(() => {
        result.current.addZoomHandlers(mockCloseAllPopups);
      });

      // Find the handlers
      const zoomStartHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoomstart')[1];
      const zoomHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoom')[1];

      // Simulate zoom start
      act(() => {
        zoomStartHandler();
      });

      // Simulate zoom (should trigger timeout)
      act(() => {
        zoomHandler();
        vi.advanceTimersByTime(100);
      });

      expect(mockCloseAllPopups).toHaveBeenCalledTimes(1);
    });

    it('should not close popups on small zoom change', () => {
      mockMap.getZoom.mockReturnValueOnce(5).mockReturnValueOnce(5.05); // Diff = 0.05 < 0.1
      
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mockCloseAllPopups = vi.fn();

      act(() => {
        result.current.addZoomHandlers(mockCloseAllPopups);
      });

      const zoomStartHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoomstart')[1];
      const zoomHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoom')[1];

      act(() => {
        zoomStartHandler();
        zoomHandler();
        vi.advanceTimersByTime(100);
      });

      expect(mockCloseAllPopups).not.toHaveBeenCalled();
    });

    it('should clean up zoom handlers', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      const mockCloseAllPopups = vi.fn();
      let cleanup;

      act(() => {
        cleanup = result.current.addZoomHandlers(mockCloseAllPopups);
      });

      act(() => {
        cleanup();
      });

      expect(mockMap.off).toHaveBeenCalledWith('zoomstart', expect.any(Function));
      expect(mockMap.off).toHaveBeenCalledWith('zoom', expect.any(Function)); 
      expect(mockMap.off).toHaveBeenCalledWith('zoomend', expect.any(Function));
    });
  });

  describe('cleanup', () => {
    it('should clean up all event handlers and remove map on unmount', () => {
      const { result, unmount } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Set up handlers to simulate being stored on map
      mockMap._tpHandlers = { 
        onMoveEnd: vi.fn(),
        onZoomEnd: vi.fn() 
      };
      mockMap._tpZoomHandlers = {
        handleZoomStart: vi.fn(),
        handleZoom: vi.fn(),
        handleZoomEnd: vi.fn(),
        zoomTimeout: 123
      };
      mockMap._tpMapClickHandler = vi.fn();

      unmount();

      expect(mockMap.off).toHaveBeenCalledWith('moveend', mockMap._tpHandlers.onMoveEnd);
      expect(mockMap.off).toHaveBeenCalledWith('zoomend', mockMap._tpHandlers.onZoomEnd);
      expect(mockMap.off).toHaveBeenCalledWith('zoomstart', mockMap._tpZoomHandlers.handleZoomStart);
      expect(mockMap.off).toHaveBeenCalledWith('zoom', mockMap._tpZoomHandlers.handleZoom);
      expect(mockMap.off).toHaveBeenCalledWith('zoomend', mockMap._tpZoomHandlers.handleZoomEnd);
      expect(mockMap.off).toHaveBeenCalledWith('click', mockMap._tpMapClickHandler);
      expect(mockMap.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup errors gracefully', () => {
      mockMap.remove.mockImplementation(() => { throw new Error('Cleanup failed'); });

      const { unmount } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Should not throw an error during unmount even if map.remove() fails
      expect(() => unmount()).not.toThrow();
    });

    it('should handle cleanup when map is null', () => {
      const { result } = renderHook(() => useMapManager({
        pins: [],
        mapboxToken: '',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      expect(() => {
        act(() => {
          result.current.cleanup();
        });
      }).not.toThrow();
    });
  });

  describe('optional callbacks', () => {
    it('should work without onMapLoad callback', () => {
      expect(() => {
        renderHook(() => useMapManager({
          pins: [],
          mapboxToken: 'test-token',
          onMapClick: mockOnMapClick,
          onMapLoad: null,
          onRecolorMarkers: mockOnRecolorMarkers
        }));
      }).not.toThrow();
    });

    it('should work without onRecolorMarkers callback', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: mockOnMapClick,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: null
      }));

      // Should not register moveend/zoomend handlers
      const moveEndCall = mockMap.on.mock.calls.find(call => call[0] === 'moveend');
      const zoomEndCall = mockMap.on.mock.calls.find(call => call[0] === 'zoomend');
      
      expect(moveEndCall).toBeUndefined();
      expect(zoomEndCall).toBeUndefined();
    });

    it('should work without onMapClick callback', () => {
      renderHook(() => useMapManager({
        pins: [],
        mapboxToken: 'test-token',
        onMapClick: null,
        onMapLoad: mockOnMapLoad,
        onRecolorMarkers: mockOnRecolorMarkers
      }));

      // Should not register click handler
      const clickCall = mockMap.on.mock.calls.find(call => call[0] === 'click');
      expect(clickCall).toBeUndefined();
    });
  });
});