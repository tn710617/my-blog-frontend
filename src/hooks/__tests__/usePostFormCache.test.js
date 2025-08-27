import { renderHook } from '@testing-library/react'
import { usePostFormCache } from '../usePostFormCache'

describe('usePostFormCache', () => {
  it('provides utility functions', () => {
    const { result } = renderHook(() => usePostFormCache())
    
    expect(typeof result.current.normalizeFormData).toBe('function')
    expect(typeof result.current.createFormHash).toBe('function')
    expect(typeof result.current.serverDataToForm).toBe('function')
    expect(typeof result.current.isLocalFormIdenticalToServer).toBe('function')
    expect(typeof result.current.getDefaultForm).toBe('function')
  })

  it('returns default form structure', () => {
    const { result } = renderHook(() => usePostFormCache())
    
    const defaultForm = result.current.getDefaultForm()
    
    expect(defaultForm).toEqual({
      tag_ids: [],
      post_title: '',
      post_content: '',
      category_id: '',
      is_public: true,
      locale: 'zh-TW',
      created_at: '',
      should_publish_medium: false
    })
  })
})