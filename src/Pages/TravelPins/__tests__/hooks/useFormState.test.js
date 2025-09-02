import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../../hooks/useFormState';

describe('useFormState', () => {
  let result;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useFormState());
    result = hookResult;
  });

  describe('initial state', () => {
    it('should initialize with empty form data', () => {
      expect(result.current.formData).toEqual({
        title: '',
        note: '',
        visited_at: '',
        photo_url: '',
        photos: [],
        coordinates: null
      });
    });

    it('should initialize with no changes', () => {
      expect(result.current.hasChanges).toBe(false);
    });

    it('should initialize with null original form data', () => {
      expect(result.current.originalFormData).toBe(null);
    });

    it('should initialize with invalid form state', () => {
      expect(result.current.isFormValid()).toBe(false);
    });
  });

  describe('handleInputChange', () => {
    it('should update form field correctly', () => {
      act(() => {
        result.current.handleInputChange('title', 'Test Title');
      });

      expect(result.current.formData.title).toBe('Test Title');
    });

    it('should update multiple fields independently', () => {
      act(() => {
        result.current.handleInputChange('title', 'Test Title');
        result.current.handleInputChange('note', 'Test Note');
        result.current.handleInputChange('photo_url', 'https://example.com/photo.jpg');
      });

      expect(result.current.formData.title).toBe('Test Title');
      expect(result.current.formData.note).toBe('Test Note');
      expect(result.current.formData.photo_url).toBe('https://example.com/photo.jpg');
    });

    it('should not detect changes when no original data exists', () => {
      act(() => {
        result.current.handleInputChange('title', 'Test Title');
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it('should detect changes when original data exists', () => {
      // First initialize with original data
      act(() => {
        result.current.initializeForm({ title: 'Original Title' });
      });

      // Then make a change
      act(() => {
        result.current.handleInputChange('title', 'Modified Title');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should not detect changes when value returns to original', () => {
      // Initialize with original data
      act(() => {
        result.current.initializeForm({ title: 'Original Title', note: 'Original Note' });
      });

      // Make a change
      act(() => {
        result.current.handleInputChange('title', 'Modified Title');
      });
      expect(result.current.hasChanges).toBe(true);

      // Revert to original
      act(() => {
        result.current.handleInputChange('title', 'Original Title');
      });
      expect(result.current.hasChanges).toBe(false);
    });

    it('should handle empty string values correctly', () => {
      // Initialize with data
      act(() => {
        result.current.initializeForm({ title: 'Original Title' });
      });

      // Change to empty string
      act(() => {
        result.current.handleInputChange('title', '');
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.formData.title).toBe('');
    });

    it('should skip change detection for photos and coordinates', () => {
      // Initialize with original data
      act(() => {
        result.current.initializeForm({ 
          title: 'Original Title',
          photos: ['photo1.jpg'],
          coordinates: [0, 0]
        });
      });

      // Change photos and coordinates (should not trigger hasChanges)
      act(() => {
        result.current.handleInputChange('photos', ['photo2.jpg']);
        result.current.handleInputChange('coordinates', [1, 1]);
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.formData.photos).toEqual(['photo2.jpg']);
      expect(result.current.formData.coordinates).toEqual([1, 1]);
    });
  });

  describe('initializeForm', () => {
    it('should initialize form with provided data', () => {
      const initialData = {
        title: 'Test Title',
        note: 'Test Note',
        visited_at: '2023-12-01',
        photo_url: 'https://example.com/photo.jpg',
        photos: ['photo1.jpg', 'photo2.jpg'],
        coordinates: [123.456, 78.901]
      };

      act(() => {
        result.current.initializeForm(initialData);
      });

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.originalFormData).toEqual(initialData);
      expect(result.current.hasChanges).toBe(false);
    });

    it('should handle partial data with defaults', () => {
      const partialData = {
        title: 'Test Title',
        note: 'Test Note'
      };

      act(() => {
        result.current.initializeForm(partialData);
      });

      expect(result.current.formData).toEqual({
        title: 'Test Title',
        note: 'Test Note',
        visited_at: '',
        photo_url: '',
        photos: [],
        coordinates: null
      });
    });

    it('should handle empty object', () => {
      act(() => {
        result.current.initializeForm({});
      });

      expect(result.current.formData).toEqual({
        title: '',
        note: '',
        visited_at: '',
        photo_url: '',
        photos: [],
        coordinates: null
      });
    });
  });

  describe('resetForm', () => {
    it('should reset form to empty state', () => {
      // First set some data
      act(() => {
        result.current.initializeForm({
          title: 'Test Title',
          note: 'Test Note',
          coordinates: [1, 2]
        });
        result.current.handleInputChange('title', 'Modified Title');
      });

      // Then reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual({
        title: '',
        note: '',
        visited_at: '',
        photo_url: '',
        photos: [],
        coordinates: null
      });
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.originalFormData).toBe(null);
    });
  });

  describe('createNewForm', () => {
    it('should create new form with coordinates', () => {
      const coordinates = [123.456, 78.901];

      act(() => {
        result.current.createNewForm(coordinates);
      });

      expect(result.current.formData.coordinates).toEqual(coordinates);
      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.note).toBe('');
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.originalFormData.coordinates).toEqual(coordinates);
    });
  });

  describe('isFormValid', () => {
    it('should return false for empty form', () => {
      expect(result.current.isFormValid()).toBe(false);
    });

    it('should return false with title but no coordinates', () => {
      act(() => {
        result.current.handleInputChange('title', 'Test Title');
      });

      expect(result.current.isFormValid()).toBe(false);
    });

    it('should return false with coordinates but no title', () => {
      act(() => {
        result.current.handleInputChange('coordinates', [1, 2]);
      });

      expect(result.current.isFormValid()).toBe(false);
    });

    it('should return false with empty/whitespace title', () => {
      act(() => {
        result.current.handleInputChange('title', '   ');
        result.current.handleInputChange('coordinates', [1, 2]);
      });

      expect(result.current.isFormValid()).toBe(false);
    });

    it('should return true with valid title and coordinates', () => {
      act(() => {
        result.current.handleInputChange('title', 'Test Title');
        result.current.handleInputChange('coordinates', [1, 2]);
      });

      expect(result.current.isFormValid()).toBe(true);
    });
  });

  describe('getFormDataForSubmission', () => {
    it('should return form data in API format', () => {
      act(() => {
        result.current.initializeForm({
          title: 'Test Title',
          note: 'Test Note',
          visited_at: '2023-12-01',
          photo_url: 'https://example.com/photo.jpg',
          photos: ['photo1.jpg'],
          coordinates: [123.456, 78.901]
        });
      });

      const submissionData = result.current.getFormDataForSubmission();

      expect(submissionData).toEqual({
        title: 'Test Title',
        note: 'Test Note',
        visited_at: '2023-12-01',
        photo_url: 'https://example.com/photo.jpg',
        photos: ['photo1.jpg'],
        coordinates: [123.456, 78.901]
      });
    });

    it('should handle empty fields correctly', () => {
      const submissionData = result.current.getFormDataForSubmission();

      expect(submissionData).toEqual({
        title: '',
        note: '',
        visited_at: '',
        photo_url: '',
        photos: [],
        coordinates: null
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle edit workflow correctly', () => {
      // Step 1: Initialize for editing
      const originalPin = {
        title: 'Original Pin',
        note: 'Original note',
        visited_at: '2023-01-01',
        coordinates: [1, 2]
      };

      act(() => {
        result.current.initializeForm(originalPin);
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.isFormValid()).toBe(true);

      // Step 2: Make changes
      act(() => {
        result.current.handleInputChange('title', 'Modified Pin');
        result.current.handleInputChange('note', 'Modified note');
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.formData.title).toBe('Modified Pin');
      expect(result.current.formData.note).toBe('Modified note');

      // Step 3: Get submission data
      const submissionData = result.current.getFormDataForSubmission();
      expect(submissionData.title).toBe('Modified Pin');
      expect(submissionData.note).toBe('Modified note');
      expect(submissionData.coordinates).toEqual([1, 2]);
    });

    it('should handle create workflow correctly', () => {
      // Step 1: Create new form at coordinates
      const newCoordinates = [100, 200];

      act(() => {
        result.current.createNewForm(newCoordinates);
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.isFormValid()).toBe(false); // No title yet

      // Step 2: Fill form
      act(() => {
        result.current.handleInputChange('title', 'New Pin');
        result.current.handleInputChange('note', 'New pin notes');
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.isFormValid()).toBe(true);

      // Step 3: Get submission data
      const submissionData = result.current.getFormDataForSubmission();
      expect(submissionData.title).toBe('New Pin');
      expect(submissionData.coordinates).toEqual(newCoordinates);
    });
  });
});