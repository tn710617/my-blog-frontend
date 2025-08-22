import { renderHook, act } from '@testing-library/react'
import { usePostTagsStore } from '../index'

describe('usePostTagsStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    act(() => {
      usePostTagsStore.setState({ tags: [] })
    })
  })

  it('initializes with empty tags array', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    expect(result.current.tags).toEqual([])
  })

  it('updates tags when setTags is called', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['1', '2', '3'])
    })
    
    expect(result.current.tags).toEqual(['1', '2', '3'])
  })

  it('replaces existing tags with new tags', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    // Set initial tags
    act(() => {
      result.current.setTags(['1', '2'])
    })
    
    expect(result.current.tags).toEqual(['1', '2'])
    
    // Replace with new tags
    act(() => {
      result.current.setTags(['3', '4', '5'])
    })
    
    expect(result.current.tags).toEqual(['3', '4', '5'])
  })

  it('handles empty array correctly', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    // Set some tags first
    act(() => {
      result.current.setTags(['1', '2', '3'])
    })
    
    // Clear tags
    act(() => {
      result.current.setTags([])
    })
    
    expect(result.current.tags).toEqual([])
  })

  it('handles string tag IDs correctly', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['10', '20', '30'])
    })
    
    expect(result.current.tags).toEqual(['10', '20', '30'])
    expect(result.current.tags.every(tag => typeof tag === 'string')).toBe(true)
  })

  it('persists state across re-renders', () => {
    const { result, rerender } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['1', '2'])
    })
    
    rerender()
    
    expect(result.current.tags).toEqual(['1', '2'])
  })

  it('allows adding single tag', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['5'])
    })
    
    expect(result.current.tags).toEqual(['5'])
    expect(result.current.tags).toHaveLength(1)
  })

  it('handles duplicate tag IDs', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['1', '2', '1', '3', '2'])
    })
    
    // Store doesn't prevent duplicates - that's handled by UI logic
    expect(result.current.tags).toEqual(['1', '2', '1', '3', '2'])
  })

  it('maintains tag order', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    act(() => {
      result.current.setTags(['z', 'a', 'm', 'c'])
    })
    
    // Should maintain the exact order provided
    expect(result.current.tags).toEqual(['z', 'a', 'm', 'c'])
  })

  it('works with multiple store instances', () => {
    const { result: result1 } = renderHook(() => usePostTagsStore())
    const { result: result2 } = renderHook(() => usePostTagsStore())
    
    // Both should start with empty tags
    expect(result1.current.tags).toEqual([])
    expect(result2.current.tags).toEqual([])
    
    // Update from first instance
    act(() => {
      result1.current.setTags(['1', '2'])
    })
    
    // Both should reflect the change (same store)
    expect(result1.current.tags).toEqual(['1', '2'])
    expect(result2.current.tags).toEqual(['1', '2'])
    
    // Update from second instance
    act(() => {
      result2.current.setTags(['3', '4'])
    })
    
    // Both should reflect the new change
    expect(result1.current.tags).toEqual(['3', '4'])
    expect(result2.current.tags).toEqual(['3', '4'])
  })

  it('provides correct function reference stability', () => {
    const { result, rerender } = renderHook(() => usePostTagsStore())
    
    const setTagsRef1 = result.current.setTags
    
    rerender()
    
    const setTagsRef2 = result.current.setTags
    
    // setTags function should be stable across re-renders
    expect(setTagsRef1).toBe(setTagsRef2)
  })

  it('handles large arrays efficiently', () => {
    const { result } = renderHook(() => usePostTagsStore())
    
    const largeTags = Array.from({ length: 100 }, (_, i) => i.toString())
    
    act(() => {
      result.current.setTags(largeTags)
    })
    
    expect(result.current.tags).toEqual(largeTags)
    expect(result.current.tags).toHaveLength(100)
  })
})