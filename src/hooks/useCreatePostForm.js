import { useState } from 'react'
import { usePostFormStore } from '../stores'

/**
 * Custom hook for managing create post form state
 * Provides a clean interface over the usePostFormStore
 * @returns {Object} Form management utilities and state
 */
export const useCreatePostForm = () => {
  // Store access
  const form = usePostFormStore((state) => state.form)
  const setFormInternal = usePostFormStore((state) => state.setForm)
  const clearFormInternal = usePostFormStore((state) => state.clearForm)

  // Track markdown content length
  const [markdownContentLen, setMarkdownContentLen] = useState(form.post_content?.length || 0)

  // Form setter - simple wrapper for component compatibility
  const setForm = (newForm) => {
    setFormInternal(newForm)
    // Update markdown length when content changes
    if (newForm.post_content !== undefined) {
      setMarkdownContentLen(newForm.post_content.length)
    }
  }

  // Clear form and reset markdown length
  const clearForm = () => {
    clearFormInternal()
    setMarkdownContentLen(0)
  }

  // Convenience method for updating markdown content
  const handleMarkdownChange = (value = "") => {
    setForm({...form, post_content: value})
  }

  // Check if form has any content (for reset button state)
  const hasContent = form.post_title || form.post_content || form.tag_ids?.length > 0

  return {
    form,
    setForm,
    clearForm,
    markdownContentLen,
    handleMarkdownChange,
    hasContent
  }
}