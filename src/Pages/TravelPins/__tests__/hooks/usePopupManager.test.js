import { renderHook, act, waitFor } from '@testing-library/react';
import { usePopupManager } from '../../hooks/usePopupManager';

describe('usePopupManager', () => {
  let mockMarkersRef;
  let mockMapRef;
  let mockOnCloseForm;
  let mockMarker1;
  let mockMarker2;
  let mockPopup1;
  let mockPopup2;

  beforeEach(() => {
    mockOnCloseForm = vi.fn();

    // Mock popups
    mockPopup1 = {
      isOpen: vi.fn(() => true),
      remove: vi.fn()
    };

    mockPopup2 = {
      isOpen: vi.fn(() => true), 
      remove: vi.fn()
    };

    // Mock markers
    mockMarker1 = {
      getPopup: vi.fn(() => mockPopup1),
      getLngLat: vi.fn(() => ({ lng: -74.0060, lat: 40.7128 }))
    };

    mockMarker2 = {
      getPopup: vi.fn(() => mockPopup2),
      getLngLat: vi.fn(() => ({ lng: -118.2437, lat: 34.0522 }))
    };

    // Mock markersRef
    mockMarkersRef = {
      current: [mockMarker1, mockMarker2]
    };

    // Mock mapRef
    mockMapRef = {
      current: {
        scrollZoom: { enable: vi.fn(), disable: vi.fn() },
        boxZoom: { enable: vi.fn(), disable: vi.fn() },
        dragRotate: { enable: vi.fn(), disable: vi.fn() },
        dragPan: { enable: vi.fn(), disable: vi.fn() },
        keyboard: { enable: vi.fn(), disable: vi.fn() },
        doubleClickZoom: { enable: vi.fn(), disable: vi.fn() },
        touchZoomRotate: { enable: vi.fn(), disable: vi.fn() }
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty popup set', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      expect(result.current.openPopups).toEqual(new Set());
      expect(typeof result.current.closeAllPopups).toBe('function');
      expect(typeof result.current.addOpenPopup).toBe('function');
      expect(typeof result.current.removeOpenPopup).toBe('function');
      expect(typeof result.current.handlePopupOpen).toBe('function');
      expect(typeof result.current.handlePopupClose).toBe('function');
      expect(typeof result.current.enableMapInteractions).toBe('function');
      expect(typeof result.current.disableMapInteractions).toBe('function');
    });
  });

  describe('popup state management', () => {
    it('should add popup to open set', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(true);
      expect(result.current.openPopups.size).toBe(1);
    });

    it('should remove popup from open set', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      // Add then remove
      act(() => {
        result.current.addOpenPopup('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(true);

      act(() => {
        result.current.removeOpenPopup('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(false);
      expect(result.current.openPopups.size).toBe(0);
    });

    it('should handle multiple popups', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin2');
        result.current.addOpenPopup('pin3');
      });

      expect(result.current.openPopups.size).toBe(3);
      expect(result.current.openPopups.has('pin1')).toBe(true);
      expect(result.current.openPopups.has('pin2')).toBe(true);
      expect(result.current.openPopups.has('pin3')).toBe(true);
    });
  });

  describe('closeAllPopups', () => {
    it('should close all popups and clear state', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      // Add some popups to state
      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin2');
      });

      expect(result.current.openPopups.size).toBe(2);

      // Close all popups
      act(() => {
        result.current.closeAllPopups();
      });

      expect(result.current.openPopups.size).toBe(0);
      expect(mockPopup1.remove).toHaveBeenCalledTimes(1);
      expect(mockPopup2.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle missing markers gracefully', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: { current: null },
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
      });

      expect(() => {
        act(() => {
          result.current.closeAllPopups();
        });
      }).not.toThrow();

      expect(result.current.openPopups.size).toBe(0);
    });

    it('should handle markers without popups', () => {
      const markerWithoutPopup = {
        getPopup: vi.fn(() => null)
      };

      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: { current: [markerWithoutPopup] },
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      expect(() => {
        act(() => {
          result.current.closeAllPopups();
        });
      }).not.toThrow();
    });

    it('should handle markers with closed popups', () => {
      const mockClosedPopup = {
        isOpen: vi.fn(() => false),
        remove: vi.fn()
      };

      const markerWithClosedPopup = {
        getPopup: vi.fn(() => mockClosedPopup)
      };

      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: { current: [markerWithClosedPopup] },
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.closeAllPopups();
      });

      expect(mockClosedPopup.remove).not.toHaveBeenCalled();
    });
  });

  describe('map interactions', () => {
    it('should enable all map interactions', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.enableMapInteractions();
      });

      expect(mockMapRef.current.scrollZoom.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.boxZoom.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.dragRotate.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.dragPan.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.keyboard.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.doubleClickZoom.enable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.touchZoomRotate.enable).toHaveBeenCalledTimes(1);
    });

    it('should disable all map interactions', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.disableMapInteractions();
      });

      expect(mockMapRef.current.scrollZoom.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.boxZoom.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.dragRotate.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.dragPan.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.keyboard.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.doubleClickZoom.disable).toHaveBeenCalledTimes(1);
      expect(mockMapRef.current.touchZoomRotate.disable).toHaveBeenCalledTimes(1);
    });

    it('should handle missing map gracefully', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: { current: null },
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      expect(() => {
        act(() => {
          result.current.enableMapInteractions();
          result.current.disableMapInteractions();
        });
      }).not.toThrow();
    });

    it('should handle map interaction errors gracefully', () => {
      const errorMapRef = {
        current: {
          scrollZoom: { enable: vi.fn(() => { throw new Error('Test error'); }) }
        }
      };

      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: errorMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      // Should not throw even when map interactions fail
      expect(() => {
        act(() => {
          result.current.enableMapInteractions();
        });
      }).not.toThrow();
      
      // Verify the error method was called
      expect(errorMapRef.current.scrollZoom.enable).toHaveBeenCalledTimes(1);
    });
  });

  describe('popup event handlers', () => {
    it('should handle popup open event', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.handlePopupOpen('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(true);
      expect(mockMapRef.current.scrollZoom.disable).toHaveBeenCalledTimes(1);
    });

    it('should handle popup close event', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      // First open a popup
      act(() => {
        result.current.handlePopupOpen('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(true);

      // Then close it
      act(() => {
        result.current.handlePopupClose('pin1');
      });

      expect(result.current.openPopups.has('pin1')).toBe(false);
      expect(mockMapRef.current.scrollZoom.enable).toHaveBeenCalledTimes(1);
    });
  });

  describe('mobile single popup policy', () => {
    it('should allow multiple popups on desktop', () => {
      const pins = [
        { id: 'pin1', coordinates: [-74.0060, 40.7128] },
        { id: 'pin2', coordinates: [-118.2437, 34.0522] }
      ];

      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins,
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin2');
      });

      expect(result.current.openPopups.size).toBe(2);
      expect(mockPopup1.remove).not.toHaveBeenCalled();
      expect(mockPopup2.remove).not.toHaveBeenCalled();
    });

    it('should enforce single popup policy on mobile', async () => {
      const pins = [
        { id: 'pin1', coordinates: [-74.0060, 40.7128] },
        { id: 'pin2', coordinates: [-118.2437, 34.0522] }
      ];

      const { result } = renderHook(() => usePopupManager({
        isMobile: true,
        pins,
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin2'); // This should close pin1
      });

      // Wait for the asynchronous state update in mobile policy
      await waitFor(() => {
        expect(result.current.openPopups.size).toBe(1);
      }, { timeout: 100 });

      expect(result.current.openPopups.has('pin2')).toBe(true);
      expect(result.current.openPopups.has('pin1')).toBe(false);
    });

    it('should handle mobile policy with missing markers gracefully', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: true,
        pins: [],
        markersRef: { current: null },
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      expect(() => {
        act(() => {
          result.current.addOpenPopup('pin1');
          result.current.addOpenPopup('pin2');
        });
      }).not.toThrow();
    });
  });

  describe('form integration', () => {
    it('should close popups when form opens', () => {
      const { result, rerender } = renderHook(
        ({ showForm }) => usePopupManager({
          isMobile: false,
          pins: [],
          markersRef: mockMarkersRef,
          mapRef: mockMapRef,
          showForm,
          onCloseForm: mockOnCloseForm
        }),
        { initialProps: { showForm: false } }
      );

      // Add some popups
      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin2');
      });

      expect(result.current.openPopups.size).toBe(2);

      // Open form - should close popups
      rerender({ showForm: true });

      expect(result.current.openPopups.size).toBe(0);
      expect(mockPopup1.remove).toHaveBeenCalledTimes(1);
      expect(mockPopup2.remove).toHaveBeenCalledTimes(1);
    });

    it('should close form when popup opens', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: true,
        onCloseForm: mockOnCloseForm
      }));

      // Open a popup while form is open - should close form
      act(() => {
        result.current.addOpenPopup('pin1');
      });

      expect(mockOnCloseForm).toHaveBeenCalledTimes(1);
    });

    it('should not close form if no onCloseForm provided', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: true,
        onCloseForm: null
      }));

      expect(() => {
        act(() => {
          result.current.addOpenPopup('pin1');
        });
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle adding same popup ID multiple times', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      act(() => {
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin1');
        result.current.addOpenPopup('pin1');
      });

      expect(result.current.openPopups.size).toBe(1);
      expect(result.current.openPopups.has('pin1')).toBe(true);
    });

    it('should handle removing non-existent popup ID', () => {
      const { result } = renderHook(() => usePopupManager({
        isMobile: false,
        pins: [],
        markersRef: mockMarkersRef,
        mapRef: mockMapRef,
        showForm: false,
        onCloseForm: mockOnCloseForm
      }));

      expect(() => {
        act(() => {
          result.current.removeOpenPopup('nonexistent');
        });
      }).not.toThrow();

      expect(result.current.openPopups.size).toBe(0);
    });
  });
});