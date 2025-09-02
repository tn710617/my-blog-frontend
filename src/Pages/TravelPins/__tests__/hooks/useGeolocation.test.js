import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../../hooks/useGeolocation';

describe('useGeolocation', () => {
  let mockGeolocation;
  let consoleErrorSpy;

  beforeEach(() => {
    // Mock console.error to prevent test output noise
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock navigator.geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn()
    };
    
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBeNull();
      expect(typeof result.current.getCurrentLocation).toBe('function');
      expect(typeof result.current.clearLocationError).toBe('function');
    });
  });

  describe('getCurrentLocation - success scenarios', () => {
    it('should handle successful location fetch', () => {
      const { result } = renderHook(() => useGeolocation());
      const mockPosition = {
        coords: { latitude: 40.7128, longitude: -74.0060 }
      };
      const onSuccessMock = vi.fn();

      // Mock successful geolocation
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      act(() => {
        result.current.getCurrentLocation(onSuccessMock);
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060
      });
      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBeNull();
    });

    it('should set loading state during location fetch', () => {
      const { result } = renderHook(() => useGeolocation());
      let geolocationCallback;

      // Mock pending geolocation request
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        geolocationCallback = success;
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      // Should be loading
      expect(result.current.isLocating).toBe(true);
      expect(result.current.locationError).toBeNull();

      // Complete the request
      act(() => {
        geolocationCallback({
          coords: { latitude: 40.7128, longitude: -74.0060 }
        });
      });

      // Should no longer be loading
      expect(result.current.isLocating).toBe(false);
    });

    it('should call getCurrentLocation with default options', () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });

    it('should call getCurrentLocation with custom options', () => {
      const { result } = renderHook(() => useGeolocation());
      const customOptions = {
        timeout: 5000,
        maximumAge: 0,
        enableHighAccuracy: false
      };

      act(() => {
        result.current.getCurrentLocation(vi.fn(), customOptions);
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        customOptions
      );
    });

    it('should work without onSuccess callback', () => {
      const { result } = renderHook(() => useGeolocation());
      const mockPosition = {
        coords: { latitude: 40.7128, longitude: -74.0060 }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      act(() => {
        result.current.getCurrentLocation();
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBeNull();
    });
  });

  describe('getCurrentLocation - error scenarios', () => {
    it('should handle geolocation not supported', () => {
      // Remove geolocation support
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true
      });

      const { result } = renderHook(() => useGeolocation());
      const onSuccessMock = vi.fn();

      act(() => {
        result.current.getCurrentLocation(onSuccessMock);
      });

      expect(onSuccessMock).not.toHaveBeenCalled();
      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBe('Geolocation is not supported by this browser');
    });

    it('should handle PERMISSION_DENIED error', () => {
      const { result } = renderHook(() => useGeolocation());
      const error = { code: 1, PERMISSION_DENIED: 1 };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBe('Location access denied. Please enable location permissions.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Geolocation error:', error);
    });

    it('should handle POSITION_UNAVAILABLE error', () => {
      const { result } = renderHook(() => useGeolocation());
      const error = { code: 2, POSITION_UNAVAILABLE: 2 };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBe('Location information unavailable.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Geolocation error:', error);
    });

    it('should handle TIMEOUT error', () => {
      const { result } = renderHook(() => useGeolocation());
      const error = { code: 3, TIMEOUT: 3 };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBe('Location request timed out. Please try again.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Geolocation error:', error);
    });

    it('should handle unknown error', () => {
      const { result } = renderHook(() => useGeolocation());
      const error = { code: 999 };

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBe('Unable to retrieve your location.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Geolocation error:', error);
    });

    it('should clear previous errors when starting new request', () => {
      const { result } = renderHook(() => useGeolocation());

      // First request fails
      const error = { code: 1, PERMISSION_DENIED: 1 };
      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.locationError).toBe('Location access denied. Please enable location permissions.');

      // Second request starts - error should be cleared
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // Don't call either callback to simulate pending state
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.locationError).toBeNull();
      expect(result.current.isLocating).toBe(true);
    });
  });

  describe('clearLocationError', () => {
    it('should clear location error', () => {
      const { result } = renderHook(() => useGeolocation());
      const error = { code: 1, PERMISSION_DENIED: 1 };

      // First, set an error
      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.locationError).toBe('Location access denied. Please enable location permissions.');

      // Clear the error
      act(() => {
        result.current.clearLocationError();
      });

      expect(result.current.locationError).toBeNull();
    });

    it('should handle clearing error when none exists', () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.clearLocationError();
      });

      expect(result.current.locationError).toBeNull();
    });
  });

  describe('multiple requests', () => {
    it('should handle multiple successful requests', () => {
      const { result } = renderHook(() => useGeolocation());
      const onSuccessMock1 = vi.fn();
      const onSuccessMock2 = vi.fn();
      
      const position1 = { coords: { latitude: 40.7128, longitude: -74.0060 } };
      const position2 = { coords: { latitude: 34.0522, longitude: -118.2437 } };

      // First request
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(position1);
      });

      act(() => {
        result.current.getCurrentLocation(onSuccessMock1);
      });

      expect(onSuccessMock1).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060
      });

      // Second request
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(position2);
      });

      act(() => {
        result.current.getCurrentLocation(onSuccessMock2);
      });

      expect(onSuccessMock2).toHaveBeenCalledWith({
        latitude: 34.0522,
        longitude: -118.2437
      });

      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBeNull();
    });

    it('should handle success after previous error', () => {
      const { result } = renderHook(() => useGeolocation());
      const onSuccessMock = vi.fn();

      // First request fails
      const error = { code: 1, PERMISSION_DENIED: 1 };
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error_callback) => {
        error_callback(error);
      });

      act(() => {
        result.current.getCurrentLocation(vi.fn());
      });

      expect(result.current.locationError).toBe('Location access denied. Please enable location permissions.');

      // Second request succeeds
      const position = { coords: { latitude: 40.7128, longitude: -74.0060 } };
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(position);
      });

      act(() => {
        result.current.getCurrentLocation(onSuccessMock);
      });

      expect(onSuccessMock).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060
      });
      expect(result.current.isLocating).toBe(false);
      expect(result.current.locationError).toBeNull();
    });
  });
});