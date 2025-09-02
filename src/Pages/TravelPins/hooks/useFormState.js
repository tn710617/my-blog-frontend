import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Travel Pin form state
 * 
 * Handles form data, change detection, input handling, and form reset functionality.
 * Tracks changes against original form data to enable unsaved changes detection.
 */
export const useFormState = () => {
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    visited_at: '',
    photo_url: '',
    photos: [],
    coordinates: null
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);

  /**
   * Handle input changes with automatic change detection
   * 
   * @param {string} field - The field name to update
   * @param {any} value - The new value for the field
   */
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      
      // Check if any field has changed from original (using updated data)
      if (originalFormData) {
        const changed = Object.keys(updatedData).some(key => {
          // Skip comparison for complex objects (photos, coordinates)
          if (key === 'photos' || key === 'coordinates') return false;
          const originalValue = originalFormData[key] || '';
          const currentValue = updatedData[key] || '';
          return originalValue !== currentValue;
        });
        setHasChanges(changed);
      }
      
      return updatedData;
    });
  }, [originalFormData]);

  /**
   * Initialize form with data (for editing existing pins)
   * 
   * @param {Object} data - The initial form data
   */
  const initializeForm = useCallback((data) => {
    const initialData = {
      title: data.title || '',
      note: data.note || '',
      visited_at: data.visited_at || '',
      photo_url: data.photo_url || '',
      photos: data.photos || [],
      coordinates: data.coordinates || null
    };
    
    setFormData(initialData);
    setOriginalFormData(initialData);
    setHasChanges(false);
  }, []);

  /**
   * Reset form to initial empty state
   */
  const resetForm = useCallback(() => {
    const emptyData = {
      title: '',
      note: '',
      visited_at: '',
      photo_url: '',
      photos: [],
      coordinates: null
    };
    
    setFormData(emptyData);
    setHasChanges(false);
    setOriginalFormData(null);
  }, []);

  /**
   * Create a new form for adding a pin at specific coordinates
   * 
   * @param {Array} coordinates - [longitude, latitude] array
   */
  const createNewForm = useCallback((coordinates) => {
    const newFormData = {
      title: '',
      note: '',
      visited_at: '',
      photo_url: '',
      photos: [],
      coordinates
    };
    
    setFormData(newFormData);
    setOriginalFormData(newFormData);
    setHasChanges(false);
  }, []);

  /**
   * Check if the current form data is valid for submission
   * 
   * @returns {boolean} True if form can be submitted
   */
  const isFormValid = useCallback(() => {
    return formData.title.trim() !== '' && formData.coordinates !== null;
  }, [formData.title, formData.coordinates]);

  /**
   * Get form data in the format expected by the API
   * 
   * @returns {Object} Formatted form data for API submission
   */
  const getFormDataForSubmission = useCallback(() => {
    return {
      title: formData.title,
      note: formData.note,
      visited_at: formData.visited_at,
      photo_url: formData.photo_url,
      photos: formData.photos,
      coordinates: formData.coordinates
    };
  }, [formData]);

  return {
    // State
    formData,
    hasChanges,
    originalFormData,
    
    // Actions
    handleInputChange,
    initializeForm,
    resetForm,
    createNewForm,
    
    // Computed
    isFormValid,
    getFormDataForSubmission
  };
};