import { renderHook, act } from '@testing-library/react'
import { usePaginationStore } from '../index'

describe('usePaginationStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    act(() => {
      usePaginationStore.setState({ currentPage: 1 })
    })
  })

  it('initializes with page 1', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    expect(result.current.currentPage).toBe(1)
  })

  it('updates current page when setCurrentPage is called', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    act(() => {
      result.current.setCurrentPage(5)
    })
    
    expect(result.current.currentPage).toBe(5)
  })

  it('handles page navigation forward', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    // Navigate forward through pages
    act(() => {
      result.current.setCurrentPage(2)
    })
    expect(result.current.currentPage).toBe(2)
    
    act(() => {
      result.current.setCurrentPage(3)
    })
    expect(result.current.currentPage).toBe(3)
  })

  it('handles page navigation backward', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    // Start at page 5
    act(() => {
      result.current.setCurrentPage(5)
    })
    
    // Navigate backward
    act(() => {
      result.current.setCurrentPage(4)
    })
    expect(result.current.currentPage).toBe(4)
    
    act(() => {
      result.current.setCurrentPage(1)
    })
    expect(result.current.currentPage).toBe(1)
  })

  it('handles large page numbers', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    act(() => {
      result.current.setCurrentPage(100)
    })
    
    expect(result.current.currentPage).toBe(100)
  })

  it('persists state across re-renders', () => {
    const { result, rerender } = renderHook(() => usePaginationStore())
    
    act(() => {
      result.current.setCurrentPage(7)
    })
    
    rerender()
    
    expect(result.current.currentPage).toBe(7)
  })

  it('works with multiple store instances', () => {
    const { result: result1 } = renderHook(() => usePaginationStore())
    const { result: result2 } = renderHook(() => usePaginationStore())
    
    // Both should start with page 1
    expect(result1.current.currentPage).toBe(1)
    expect(result2.current.currentPage).toBe(1)
    
    // Update from first instance
    act(() => {
      result1.current.setCurrentPage(3)
    })
    
    // Both should reflect the change (same store)
    expect(result1.current.currentPage).toBe(3)
    expect(result2.current.currentPage).toBe(3)
    
    // Update from second instance
    act(() => {
      result2.current.setCurrentPage(8)
    })
    
    // Both should reflect the new change
    expect(result1.current.currentPage).toBe(8)
    expect(result2.current.currentPage).toBe(8)
  })

  it('provides correct function reference stability', () => {
    const { result, rerender } = renderHook(() => usePaginationStore())
    
    const setCurrentPageRef1 = result.current.setCurrentPage
    
    rerender()
    
    const setCurrentPageRef2 = result.current.setCurrentPage
    
    // setCurrentPage function should be stable across re-renders
    expect(setCurrentPageRef1).toBe(setCurrentPageRef2)
  })

  it('handles rapid page changes correctly', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    // Rapid succession of page changes
    act(() => {
      result.current.setCurrentPage(2)
      result.current.setCurrentPage(3)
      result.current.setCurrentPage(4)
      result.current.setCurrentPage(1)
    })
    
    // Should end with the last value
    expect(result.current.currentPage).toBe(1)
  })

  it('handles edge case page numbers', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    // Test with page 0 (should work, though UI might handle validation)
    act(() => {
      result.current.setCurrentPage(0)
    })
    expect(result.current.currentPage).toBe(0)
    
    // Test with negative page (should work at store level)
    act(() => {
      result.current.setCurrentPage(-1)
    })
    expect(result.current.currentPage).toBe(-1)
    
    // Test with decimal (should work, though typically integers)
    act(() => {
      result.current.setCurrentPage(2.5)
    })
    expect(result.current.currentPage).toBe(2.5)
  })

  it('integrates properly with filter resets', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    // Navigate to page 10
    act(() => {
      result.current.setCurrentPage(10)
    })
    expect(result.current.currentPage).toBe(10)
    
    // Simulate filter change resetting pagination
    act(() => {
      result.current.setCurrentPage(1)
    })
    expect(result.current.currentPage).toBe(1)
  })

  it('maintains type consistency', () => {
    const { result } = renderHook(() => usePaginationStore())
    
    act(() => {
      result.current.setCurrentPage(5)
    })
    
    expect(typeof result.current.currentPage).toBe('number')
    expect(result.current.currentPage).toBe(5)
  })
})