/**
 * Tests for usePostFormStore: defaults, update, clear, persistence
 */

describe('usePostFormStore', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('has default form values and updates/clears correctly', () => {
    const { usePostFormStore } = require('..')

    const initial = usePostFormStore.getState().form
    expect(initial).toMatchObject({
      tag_ids: [],
      post_title: '',
      post_content: '',
      category_id: '2',
      is_public: true,
      should_publish_medium: false,
      locale: 'zh-TW',
      created_at: ''
    })

    // updateForm merges
    usePostFormStore.getState().updateForm({ post_title: 'Hello', tag_ids: [1, 2] })
    expect(usePostFormStore.getState().form.post_title).toBe('Hello')
    expect(usePostFormStore.getState().form.tag_ids).toEqual([1, 2])

    // clearForm resets to defaults
    usePostFormStore.getState().clearForm()
    expect(usePostFormStore.getState().form).toMatchObject(initial)
  })

  it('persists only the form key via partialize', () => {
    const { usePostFormStore } = require('..')

    usePostFormStore.getState().updateForm({ post_title: 'Persisted' })

    const raw = localStorage.getItem('learn_or_die_post_form_storage')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw)
    expect(Object.keys(parsed.state)).toEqual(['form'])
    expect(parsed.state.form.post_title).toBe('Persisted')
  })
})

