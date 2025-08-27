import { useMemo, useEffect } from 'react'
import { useEditPostFormStore } from '../stores'
import { usePostFormCache } from './usePostFormCache'

/**
 * Custom hook for managing edit post form state with caching
 * @param {string} postId - The ID of the post being edited
 * @param {Object} serverData - Server data for the post
 * @returns {Object} Form management utilities and state
 */
export const useEditPostForm = (postId, serverData) => {
  const { 
    serverDataToForm, 
    isLocalFormIdenticalToServer,
    getDefaultForm 
  } = usePostFormCache()
  
  // Store access
  const cachedForms = useEditPostFormStore((state) => state.forms)
  const setFormInStore = useEditPostFormStore((state) => state.setForm)
  const clearFormFromStore = useEditPostFormStore((state) => state.clearForm)

  // Get cached form for this post
  const cachedForm = useMemo(() => {
    return cachedForms[postId] || null
  }, [cachedForms, postId])

  // Check if user has unsaved changes
  const hasUnsavedChanges = cachedForm !== null

  // Display form: cached data (if user edited) OR server data (for display only)
  const displayForm = useMemo(() => {
    if (cachedForm) {
      return cachedForm
    }

    if (serverData) {
      return serverDataToForm(serverData)
    }

    return getDefaultForm()
  }, [cachedForm, serverData, serverDataToForm, getDefaultForm])

  // Check if form should be persisted based on comparison with server data
  const shouldPersistForm = (formData) => {
    if (!serverData) return true // No server data to compare, persist anyway
    return !isLocalFormIdenticalToServer(formData, serverData)
  }

  // Form setter with conditional persistence
  const setForm = (newForm) => {
      setFormInStore(postId, newForm)
  }

  // Clear form from cache
  const clearForm = () => {
    clearFormFromStore(postId)
  }

  // Auto-clear cached form when display form becomes identical to server data
  useEffect(() => {
    const isIdentical = isLocalFormIdenticalToServer(displayForm, serverData)
    if (isIdentical && cachedForm) {
      clearFormFromStore(postId)
    }
  }, [displayForm, serverData, cachedForm, postId, clearFormFromStore, isLocalFormIdenticalToServer])

  return {
    displayForm,
    hasUnsavedChanges,
    setForm,
    clearForm,
    cachedForm
  }
}