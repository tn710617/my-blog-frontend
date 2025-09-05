// Travel Pins API integration for New implementation
// Re-exports the existing API hooks with any additional utilities needed

import {
  useTravelPins,
  useTravelPin,
  useCreateTravelPin,
  useUpdateTravelPin,
  useDeleteTravelPin,
  useOptimisticTravelPinUpdate,
  TRAVEL_PINS_QUERY_KEYS
} from '../../APIs/travel-pins';

// Re-export all API hooks
export {
  useTravelPins,
  useTravelPin,
  useCreateTravelPin,
  useUpdateTravelPin,
  useDeleteTravelPin,
  useOptimisticTravelPinUpdate,
  TRAVEL_PINS_QUERY_KEYS
};

// Additional helper for getting a pin by ID from cache
export const usePinFromCache = (pinId) => {
  const { data: pins = [] } = useTravelPins({ 
    staleTime: Infinity, // Don't refetch just for cache lookup
  });
  
  return pins.find(pin => pin.id?.toString() === pinId?.toString()) || null;
};