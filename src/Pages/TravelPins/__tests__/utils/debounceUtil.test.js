import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../utils/debounceUtil';

describe('debounceUtil', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should call the function after the specified wait time', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should delay the function call if called multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);
      
      debouncedFn('second');
      vi.advanceTimersByTime(50);
      
      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      // Now it should be called with the last arguments
      expect(mockFn).toHaveBeenCalledWith('second');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass all arguments to the debounced function', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should work with different wait times', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn('test');
      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should handle rapid successive calls correctly', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Rapid fire calls
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');
      debouncedFn('call4');

      // No calls should have been made yet
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      
      // Only the last call should be executed
      expect(mockFn).toHaveBeenCalledWith('call4');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should create independent debounced functions', () => {
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();
      const debouncedFn1 = debounce(mockFn1, 100);
      const debouncedFn2 = debounce(mockFn2, 100);

      debouncedFn1('fn1');
      debouncedFn2('fn2');

      vi.advanceTimersByTime(100);

      expect(mockFn1).toHaveBeenCalledWith('fn1');
      expect(mockFn2).toHaveBeenCalledWith('fn2');
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
    });
  });
});