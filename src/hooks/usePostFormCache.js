import { useCallback } from 'react'
import dayjs from 'dayjs'

/**
 * Custom hook for managing post form caching logic
 * Provides utilities for form data normalization and comparison
 */
export const usePostFormCache = () => {

  /**
   * Normalizes form data structure for consistent comparison
   * @param {Object} data - The form data to normalize
   * @param {boolean} isServerData - Whether the data comes from server (has different structure)
   * @returns {Object} Normalized form data
   */
  const normalizeFormData = useCallback((data, isServerData = false) => {
    if (!data) return null

    return {
      tag_ids: isServerData
        ? [...data.tags.map(tag => tag.id)].sort()
        : [...(data.tag_ids || [])].sort(),
      post_title: data.post_title || '',
      post_content: data.post_content || '',
      category_id: data.category_id || '',
      is_public: data.is_public ?? true,
      locale: data.locale || 'zh-TW',
      created_at: isServerData
        ? dayjs(data.created_at).toISOString().slice(0, -1)
        : data.created_at || '',
      should_publish_medium: data.should_publish_medium || false
    }
  }, [])

  /**
   * Creates a hash string from normalized form data for comparison
   * @param {Object} data - The form data to hash
   * @param {boolean} isServerData - Whether the data comes from server
   * @returns {string} Hash string representation of the data
   */
  const createFormHash = useCallback((data, isServerData = false) => {
    const normalized = normalizeFormData(data, isServerData)
    return normalized ? JSON.stringify(normalized) : ''
  }, [normalizeFormData])

  /**
   * Converts server data to display form structure
   * @param {Object} serverData - Server response data
   * @returns {Object} Display form compatible data
   */
  const serverDataToForm = useCallback((serverData) => {
    if (!serverData) return null

    return {
      tag_ids: serverData.tags?.map(tag => tag.id) || [],
      post_title: serverData.post_title || '',
      post_content: serverData.post_content || '',
      category_id: serverData.category_id || '',
      is_public: serverData.is_public ?? true,
      locale: serverData.locale || 'zh-TW',
      created_at: serverData.created_at
        ? dayjs(serverData.created_at).toISOString().slice(0, -1)
        : '',
      should_publish_medium: serverData.should_publish_medium || false
    }
  }, [])

  /**
   * Compares form data with server data to determine if they're identical
   * @param {Object} formData - Current form data
   * @param {Object} serverData - Server data to compare against
   * @returns {boolean} Whether the data is identical
   */
  const isLocalFormIdenticalToServer = useCallback((localForm, serverData) => {
    if (!serverData || !localForm) return false

    const serverHash = createFormHash(serverData, true)
    const formHash = createFormHash(localForm, false)

    return serverHash === formHash
  }, [createFormHash])

  /**
   * Default form structure for initialization
   */
  const getDefaultForm = useCallback(() => ({
    tag_ids: [],
    post_title: '',
    post_content: '',
    category_id: '',
    is_public: true,
    locale: 'zh-TW',
    created_at: '',
    should_publish_medium: false
  }), [])

  return {
    normalizeFormData,
    createFormHash,
    serverDataToForm,
    isLocalFormIdenticalToServer,
    getDefaultForm
  }
}