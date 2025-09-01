import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'react-intl';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores';
import {
  useTravelPins,
  useCreateTravelPin,
  useUpdateTravelPin,
  useDeleteTravelPin,
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
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({ isLoggedIn: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      useAuthStore.mockReturnValue({ isLoggedIn: false });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTravelPin(), { wrapper });

      try {
        await result.current.mutateAsync({});
        // If we reach here, the mutation didn't throw, which means auth check failed
        expect(true).toBe(false); // Force failure
      } catch (error) {
        expect(error.message).toBe('Authentication required');
      }
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