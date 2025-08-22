import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useDebounce } from '../useDebounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('does not update value before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update the value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be initial before delay
    expect(result.current).toBe('initial')

    // Advance timer by 400ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(result.current).toBe('initial')
  })

  it('updates value after delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Update the value
    rerender({ value: 'updated', delay: 500 })

    // Advance timer past the delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('resets timer when value changes before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // First value change
    rerender({ value: 'first', delay: 500 })

    // Advance timer partially
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('initial')

    // Second value change should reset timer
    rerender({ value: 'second', delay: 500 })

    // Advance by another 300ms (total 600ms from start, but only 300ms from second change)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should still be initial because timer was reset
    expect(result.current).toBe('initial')

    // Advance by remaining 200ms to complete the delay
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now should have the second value
    expect(result.current).toBe('second')
  })

  it('handles multiple rapid value changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    // Simulate rapid typing
    rerender({ value: 'r', delay: 300 })
    act(() => { vi.advanceTimersByTime(50) })

    rerender({ value: 're', delay: 300 })
    act(() => { vi.advanceTimersByTime(50) })

    rerender({ value: 'rea', delay: 300 })
    act(() => { vi.advanceTimersByTime(50) })

    rerender({ value: 'reac', delay: 300 })
    act(() => { vi.advanceTimersByTime(50) })

    rerender({ value: 'react', delay: 300 })

    // Should still be initial value
    expect(result.current).toBe('initial')

    // Complete the debounce delay
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should now have the final value
    expect(result.current).toBe('react')
  })

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Should not update after 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('test')

    // Should update after full 1000ms
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'immediate', delay: 0 })

    // With zero delay, should update on next tick
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe('immediate')
  })

  it('cleans up timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 500 })

    // Unmount before delay completes
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })
})