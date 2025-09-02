import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'react-intl';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores';
import {
  useTravelPins,
  useTravelPin,
  useCreateTravelPin,
  useUpdateTravelPin,
  useDeleteTravelPin,
  useOptimisticTravelPinUpdate,
  TRAVEL_PINS_QUERY_KEYS
} from '../travel-pins';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('../axios');
vi.mock('../useAxios');
vi.mock('../../stores');

// Mock axios responses
const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
const mockAxiosPut = vi.fn();
const mockAxiosDelete = vi.fn();

vi.mock('../axios', () => ({
  default: vi.fn(() => ({
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
  }))
}));

vi.mock('../useAxios', () => ({
  default: vi.fn(() => ({
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
  }))
}));

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  // Mock translation messages for testing
  const messages = {
    'travel_pins.toast.pin_created': 'Travel pin created successfully!',
    'travel_pins.toast.pin_updated': 'Travel pin updated successfully!',
    'travel_pins.toast.pin_deleted': 'Travel pin deleted successfully!',
    'travel_pins.toast.auth_required': 'Please log in to create or modify travel pins',
    'travel_pins.toast.unauthorized': 'You don\'t have permission to modify this travel pin',
    'travel_pins.toast.pin_not_found': 'Travel pin not found',
    'travel_pins.toast.validation_error': 'Please check the form for errors',
    'travel_pins.toast.create_error': 'Failed to create travel pin. Please try again.',
    'travel_pins.toast.update_error': 'Failed to update travel pin. Please try again.',
    'travel_pins.toast.delete_error': 'Failed to delete travel pin. Please try again.',
  };

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={messages}>
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('Travel Pins API Hooks', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({ isLoggedIn: true });
    // Mock console.error to prevent error logs in test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('useTravelPins', () => {
    it('should fetch and transform travel pins correctly', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 1,
              title: 'Test Pin',
              note: 'Test note',
              latitude: '25.03396400',
              longitude: '121.56447200',
              visited_at: '2024-03-15',
              photo_url: 'https://example.com/photo.jpg',
              created_at: '2024-03-15T10:30:00.000000Z',
              updated_at: '2024-03-15T10:30:00.000000Z'
            }
          ]
        }
      };

      mockAxiosGet.mockResolvedValue(mockApiResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPins(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        {
          id: 1,
          title: 'Test Pin',
          note: 'Test note',
          coordinates: [121.56447200, 25.03396400], // [lng, lat]
          visited_at: '2024-03-15',
          photo_url: 'https://example.com/photo.jpg',
          created_at: '2024-03-15T10:30:00.000000Z',
          updated_at: '2024-03-15T10:30:00.000000Z'
        }
      ]);

      expect(mockAxiosGet).toHaveBeenCalledWith('travel-pins');
    });

    it('should handle API errors gracefully', async () => {
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPins(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useTravelPin', () => {
    it('should fetch and transform single travel pin correctly', async () => {
      const mockApiResponse = {
        data: {
          data: {
            id: 1,
            title: 'Single Pin',
            note: 'Single note',
            latitude: '25.03396400',
            longitude: '121.56447200',
            visited_at: '2024-03-15',
            photo_url: 'https://example.com/single.jpg',
            created_at: '2024-03-15T10:30:00.000000Z',
            updated_at: '2024-03-15T10:30:00.000000Z'
          }
        }
      };

      mockAxiosGet.mockResolvedValue(mockApiResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPin(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        id: 1,
        title: 'Single Pin',
        note: 'Single note',
        coordinates: [121.56447200, 25.03396400], // [lng, lat]
        visited_at: '2024-03-15',
        photo_url: 'https://example.com/single.jpg',
        created_at: '2024-03-15T10:30:00.000000Z',
        updated_at: '2024-03-15T10:30:00.000000Z'
      });

      expect(mockAxiosGet).toHaveBeenCalledWith('travel-pins/1');
    });

    it('should be disabled when id is not provided', () => {
      mockAxiosGet.mockClear();

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPin(null), { wrapper });

      // Query should be disabled, so data is undefined and axios not called
      expect(result.current.data).toBeUndefined();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('should handle 404 errors gracefully', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Travel pin not found' }
        }
      };

      mockAxiosGet.mockRejectedValue(notFoundError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPin(999), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(notFoundError);
    });
  });

  describe('useCreateTravelPin', () => {
    it('should create a travel pin successfully', async () => {
      const mockApiResponse = {
        data: {
          data: {
            id: 2,
            title: 'New Pin',
            note: 'New note',
            latitude: '40.7128',
            longitude: '-74.0060',
            visited_at: '2024-03-20',
            photo_url: null,
            created_at: '2024-03-20T10:30:00.000000Z',
            updated_at: '2024-03-20T10:30:00.000000Z'
          }
        }
      };

      mockAxiosPost.mockResolvedValue(mockApiResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTravelPin(), { wrapper });

      const pinData = {
        title: 'New Pin',
        note: 'New note',
        coordinates: [-74.0060, 40.7128], // [lng, lat]
        visited_at: '2024-03-20'
      };

      await result.current.mutateAsync(pinData);

      expect(mockAxiosPost).toHaveBeenCalledWith('travel-pins', {
        title: 'New Pin',
        note: 'New note',
        latitude: 40.7128,
        longitude: -74.0060,
        visited_at: '2024-03-20',
        photo_url: null
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      // Reset the axios mock to not interfere
      mockAxiosPost.mockClear();
      
      // Mock the auth store to return false for isLoggedIn
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { isLoggedIn: false };
        return selector(state);
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTravelPin(), { wrapper });

      await expect(result.current.mutateAsync({})).rejects.toThrow('Authentication required');
      
      // Ensure axios wasn't called since auth failed
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            errors: {
              title: ['The title field is required.']
            }
          }
        }
      };

      mockAxiosPost.mockRejectedValue(validationError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTravelPin(), { wrapper });

      await expect(result.current.mutateAsync({})).rejects.toEqual(validationError);
      expect(toast.error).toHaveBeenCalledWith('The title field is required.');
    });
  });

  describe('useUpdateTravelPin', () => {
    it('should update a travel pin successfully', async () => {
      const mockApiResponse = {
        data: {
          data: {
            id: 1,
            title: 'Updated Pin',
            note: 'Updated note',
            latitude: '25.03396400',
            longitude: '121.56447200',
            visited_at: '2024-03-15',
            photo_url: 'https://example.com/updated.jpg',
            created_at: '2024-03-15T10:30:00.000000Z',
            updated_at: '2024-03-20T15:45:00.000000Z'
          }
        }
      };

      mockAxiosPut.mockResolvedValue(mockApiResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTravelPin(), { wrapper });

      const updateData = {
        id: 1,
        pinData: {
          title: 'Updated Pin',
          note: 'Updated note',
          coordinates: [121.56447200, 25.03396400],
          photo_url: 'https://example.com/updated.jpg'
        }
      };

      await result.current.mutateAsync(updateData);

      expect(mockAxiosPut).toHaveBeenCalledWith('travel-pins/1', {
        title: 'Updated Pin',
        note: 'Updated note',
        latitude: 25.03396400,
        longitude: 121.56447200,
        visited_at: null,
        photo_url: 'https://example.com/updated.jpg'
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle 403 authorization errors', async () => {
      const authError = {
        response: {
          status: 403,
          data: { message: 'Unauthorized' }
        }
      };

      mockAxiosPut.mockRejectedValue(authError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTravelPin(), { wrapper });

      await expect(result.current.mutateAsync({ id: 1, pinData: {} })).rejects.toEqual(authError);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useDeleteTravelPin', () => {
    it('should delete a travel pin successfully', async () => {
      mockAxiosDelete.mockResolvedValue({ status: 204 });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTravelPin(), { wrapper });

      await result.current.mutateAsync(1);

      expect(mockAxiosDelete).toHaveBeenCalledWith('travel-pins/1');
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle 404 not found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      mockAxiosDelete.mockRejectedValue(notFoundError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTravelPin(), { wrapper });

      await expect(result.current.mutateAsync(999)).rejects.toEqual(notFoundError);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useOptimisticTravelPinUpdate', () => {
    let queryClient;
    let optimisticHelpers;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      });

      // Pre-populate cache with initial data
      queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), [
        {
          id: 1,
          title: 'Existing Pin',
          coordinates: [121.5, 25.0],
          note: 'Original note'
        },
        {
          id: 2,
          title: 'Another Pin',
          coordinates: [122.0, 26.0],
          note: 'Another note'
        }
      ]);

      // Create wrapper with our test query client
      const TestWrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale="en" messages={{}}>
            {children}
          </IntlProvider>
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useOptimisticTravelPinUpdate(), { 
        wrapper: TestWrapper 
      });
      optimisticHelpers = result.current;
    });

    it('should add optimistic pin to cache', () => {
      const tempPin = {
        title: 'Optimistic Pin',
        coordinates: [123.0, 27.0],
        note: 'Optimistic note'
      };

      optimisticHelpers.addOptimisticPin(tempPin);

      const updatedData = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(updatedData).toHaveLength(3);
      
      const newPin = updatedData[2];
      expect(newPin.title).toBe('Optimistic Pin');
      expect(newPin.coordinates).toEqual([123.0, 27.0]);
      expect(newPin.id).toMatch(/^temp-/); // Should have temp ID
      expect(newPin.created_at).toBeDefined();
      expect(newPin.updated_at).toBeDefined();
    });

    it('should remove optimistic pin from cache', () => {
      // First add an optimistic pin
      optimisticHelpers.addOptimisticPin({
        title: 'To Remove',
        coordinates: [124.0, 28.0]
      });

      let data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(data).toHaveLength(3);

      const tempId = data[2].id;

      // Now remove it
      optimisticHelpers.removeOptimisticPin(tempId);

      data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(data).toHaveLength(2);
      expect(data.find(pin => pin.id === tempId)).toBeUndefined();
    });

    it('should update optimistic pin in cache', () => {
      const updates = {
        title: 'Updated Title',
        note: 'Updated note'
      };

      optimisticHelpers.updateOptimisticPin(1, updates);

      const data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      const updatedPin = data.find(pin => pin.id === 1);
      
      expect(updatedPin.title).toBe('Updated Title');
      expect(updatedPin.note).toBe('Updated note');
      expect(updatedPin.coordinates).toEqual([121.5, 25.0]); // Original coordinates preserved
    });

    it('should handle empty cache gracefully', () => {
      // Clear the cache
      queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), null);

      const tempPin = { title: 'Test', coordinates: [120.0, 24.0] };
      
      optimisticHelpers.addOptimisticPin(tempPin);

      const data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Test');
    });

    it('should handle removing non-existent pin gracefully', () => {
      const initialData = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      
      optimisticHelpers.removeOptimisticPin('non-existent-id');

      const data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(data).toEqual(initialData); // No change
    });

    it('should handle updating non-existent pin gracefully', () => {
      const initialData = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      
      optimisticHelpers.updateOptimisticPin('non-existent-id', { title: 'Updated' });

      const data = queryClient.getQueryData(TRAVEL_PINS_QUERY_KEYS.list());
      expect(data).toEqual(initialData); // No change
    });
  });

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(TRAVEL_PINS_QUERY_KEYS.all).toEqual(['travel-pins']);
      expect(TRAVEL_PINS_QUERY_KEYS.lists()).toEqual(['travel-pins', 'list']);
      expect(TRAVEL_PINS_QUERY_KEYS.list({ filter: 'test' })).toEqual([
        'travel-pins', 
        'list', 
        { filters: { filter: 'test' } }
      ]);
      expect(TRAVEL_PINS_QUERY_KEYS.details()).toEqual(['travel-pins', 'detail']);
      expect(TRAVEL_PINS_QUERY_KEYS.detail(123)).toEqual(['travel-pins', 'detail', 123]);
    });
  });

  describe('Data Transformation', () => {
    it('should handle null/undefined values correctly', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 1,
              title: 'Test Pin',
              note: null,
              latitude: '25.03396400',
              longitude: '121.56447200',
              visited_at: null,
              photo_url: null,
              created_at: '2024-03-15T10:30:00.000000Z',
              updated_at: '2024-03-15T10:30:00.000000Z'
            }
          ]
        }
      };

      mockAxiosGet.mockResolvedValue(mockApiResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTravelPins(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data[0]).toEqual({
        id: 1,
        title: 'Test Pin',
        note: null,
        coordinates: [121.56447200, 25.03396400],
        visited_at: null,
        photo_url: null,
        created_at: '2024-03-15T10:30:00.000000Z',
        updated_at: '2024-03-15T10:30:00.000000Z'
      });
    });
  });
});