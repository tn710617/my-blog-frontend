/**
 * Tests for useEditPostFormStore: set/get/update/clear and persistence
 */

describe('useEditPostFormStore', () => {
  beforeEach(() => {
    jest.resetModules()
    localStorage.clear()
  })

  it('returns null when no cached form exists', () => {
    const { useEditPostFormStore } = require('..')
    expect(useEditPostFormStore.getState().getForm('123')).toBeNull()
  })

  it('sets, gets, updates and clears a form by postId', () => {
    const { useEditPostFormStore } = require('..')
    const postId = '123'

    const baseForm = { post_title: 'Title', tag_ids: [1], post_content: 'abc', category_id: '2', is_public: true, locale: 'en', created_at: '', should_publish_medium: false }
    useEditPostFormStore.getState().setForm(postId, baseForm)
    expect(useEditPostFormStore.getState().getForm(postId)).toMatchObject(baseForm)

    useEditPostFormStore.getState().updateForm(postId, { post_title: 'Updated' })
    expect(useEditPostFormStore.getState().getForm(postId).post_title).toBe('Updated')

    useEditPostFormStore.getState().clearForm(postId)
    expect(useEditPostFormStore.getState().getForm(postId)).toBeNull()
  })

  it('persists only forms key via partialize', () => {
    const { useEditPostFormStore } = require('..')
    const postId = '99'
    useEditPostFormStore.getState().setForm(postId, { post_title: 'Persist' })

    const raw = localStorage.getItem('learn_or_die_edit_form_storage')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw)
    expect(Object.keys(parsed.state)).toEqual(['forms'])
    expect(parsed.state.forms[postId].post_title).toBe('Persist')
  })
})

