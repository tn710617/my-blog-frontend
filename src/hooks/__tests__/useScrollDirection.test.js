import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useScrollDirection from '../useScrollDirection';

describe('useScrollDirection', () => {
  beforeEach(() => {
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
    });
    // Mock document and window dimensions to avoid bounce logic interference
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null initially', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe(null);
  });

  it('should add event listener on mount', () => {
    renderHook(() => useScrollDirection());
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollDirection());
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('should detect scroll down', () => {
    const { result } = renderHook(() => useScrollDirection());
    
    act(() => {
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('down');
  });

  it('should detect scroll up', () => {
    const { result } = renderHook(() => useScrollDirection());
    
    // First scroll down significantly
    act(() => {
      window.pageYOffset = 300;
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(result.current).toBe('down');
    
    // Then scroll up significantly (more than 10px threshold)
    act(() => {
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('up');
  });

  it('should not change direction for small scroll movements', () => {
    const { result } = renderHook(() => useScrollDirection());
    
    act(() => {
      window.pageYOffset = 5;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(null);
  });

  it('should always show navbar when at top of page', () => {
    const { result } = renderHook(() => useScrollDirection());
    
    // Scroll down first
    act(() => {
      window.pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
    });
    
    expect(result.current).toBe('down');
    
    // Then scroll back to top (including negative values for mobile bounce)
    act(() => {
      window.pageYOffset = 0;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('up');
    
    // Test negative scroll values (mobile Safari bounce)
    act(() => {
      window.pageYOffset = -10;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe('up');
  });
});