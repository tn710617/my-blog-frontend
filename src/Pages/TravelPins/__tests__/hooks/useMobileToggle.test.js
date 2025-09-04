import { renderHook, act } from '@testing-library/react';
import { useMobileToggle } from '../../hooks/useMobileToggle';

// Mock map object
const createMockMap = () => ({
  scrollZoom: { enable: vi.fn(), disable: vi.fn() },
  dragPan: { enable: vi.fn(), disable: vi.fn() },
  dragRotate: { enable: vi.fn(), disable: vi.fn() },
  touchZoomRotate: { enable: vi.fn(), disable: vi.fn() },
  touchPitch: { enable: vi.fn(), disable: vi.fn() },
  getContainer: vi.fn(() => ({
    style: { touchAction: '' }
  }))
});

describe('useMobileToggle', () => {
  let mockMap;
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    mockMap = createMockMap();
    
    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mobile',
        maxTouchPoints: 2
      },
      writable: true
    });

    // Mock window
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        innerWidth: 600,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('should initialize with default rotation mode', () => {
    const { result } = renderHook(() => useMobileToggle(mockMap));

    expect(result.current.isRotationMode).toBe(true);
  });

  it('should detect mobile device', () => {
    const { result } = renderHook(() => useMobileToggle(mockMap));

    expect(result.current.isMobile).toBe(true);
  });

  it('should toggle rotation mode', () => {
    const { result } = renderHook(() => useMobileToggle(mockMap));

    act(() => {
      result.current.handleToggle(false);
    });

    expect(result.current.isRotationMode).toBe(false);
  });

  it('should enable map interactions in rotation mode', () => {
    renderHook(() => useMobileToggle(mockMap));

    // Wait for useEffect to run
    expect(mockMap.scrollZoom.enable).toHaveBeenCalled();
    expect(mockMap.dragPan.enable).toHaveBeenCalled();
    expect(mockMap.dragRotate.enable).toHaveBeenCalled();
    expect(mockMap.touchZoomRotate.enable).toHaveBeenCalled();
    expect(mockMap.touchPitch.enable).toHaveBeenCalled();
  });

  it('should disable map interactions in scroll mode', () => {
    const { result } = renderHook(() => useMobileToggle(mockMap));

    act(() => {
      result.current.handleToggle(false);
    });

    expect(mockMap.scrollZoom.disable).toHaveBeenCalled();
    expect(mockMap.dragPan.disable).toHaveBeenCalled();
    expect(mockMap.dragRotate.disable).toHaveBeenCalled();
    expect(mockMap.touchZoomRotate.disable).toHaveBeenCalled();
    expect(mockMap.touchPitch.disable).toHaveBeenCalled();
  });

  it('should handle missing map gracefully', () => {
    const { result } = renderHook(() => useMobileToggle(null));

    expect(result.current.isRotationMode).toBe(true);
    expect(result.current.isMobile).toBe(true);

    // Should not throw error
    act(() => {
      result.current.handleToggle(false);
    });
  });

  it('should set touch action on map container', () => {
    const container = { style: { touchAction: '' } };
    mockMap.getContainer.mockReturnValue(container);

    const { result } = renderHook(() => useMobileToggle(mockMap));

    // Initially in rotation mode
    expect(container.style.touchAction).toBe('none');

    act(() => {
      result.current.handleToggle(false);
    });

    // In scroll mode
    expect(container.style.touchAction).toBe('auto');
  });
});