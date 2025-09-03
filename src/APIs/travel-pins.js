import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuthStore} from "../stores";
import useAxios from "./useAxios";
import {useIntl} from "react-intl";
import toast from "react-hot-toast";

// Query Keys
export const TRAVEL_PINS_QUERY_KEYS = {
    all: ['travel-pins'],
    lists: () => [...TRAVEL_PINS_QUERY_KEYS.all, 'list'],
    list: (filters) => [...TRAVEL_PINS_QUERY_KEYS.lists(), {filters}],
    details: () => [...TRAVEL_PINS_QUERY_KEYS.all, 'detail'],
    detail: (id) => [...TRAVEL_PINS_QUERY_KEYS.details(), id],
};

// Helper function to transform API data to frontend format
const transformPinFromAPI = (apiPin) => {
    return {
        id: apiPin.id,
        title: apiPin.title,
        note: apiPin.note,
        visited_at: apiPin.visited_at,
        photo_url: apiPin.photo_url,
        coordinates: [Number(apiPin.longitude), Number(apiPin.latitude)], // API: lat/lng separate, Frontend: [lng, lat]
        created_at: apiPin.created_at,
        updated_at: apiPin.updated_at,
    };
};

// Helper function to transform frontend data to API format
const transformPinToAPI = (frontendPin) => {
    return {
        title: frontendPin.title,
        note: frontendPin.note || null,
        visited_at: frontendPin.visited_at || null,
        photo_url: frontendPin.photo_url || null,
        latitude: frontendPin.coordinates ? frontendPin.coordinates[1] : null, // Frontend: [lng, lat], API: separate fields
        longitude: frontendPin.coordinates ? frontendPin.coordinates[0] : null,
    };
};

// Get All Travel Pins (Public)
export function useTravelPins(options = {}) {
    const axios = useAxios();

    return useQuery({
        queryKey: TRAVEL_PINS_QUERY_KEYS.list(),
        queryFn: async () => {
            const response = await axios.get('travel-pins');
            return response.data.data.map(transformPinFromAPI);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        ...options
    });
}

// Get Single Travel Pin (Public)
export function useTravelPin(id, options = {}) {
    const axios = useAxios();

    return useQuery({
        queryKey: TRAVEL_PINS_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await axios.get(`travel-pins/${id}`);
            return transformPinFromAPI(response.data.data);
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        ...options
    });
}

// Create Travel Pin (Authenticated)
export function useCreateTravelPin() {
    const queryClient = useQueryClient();
    const intl = useIntl();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const axios = useAxios();

    return useMutation({
        mutationFn: async (pinData) => {
            console.log('✨ CREATE PIN MUTATION - starting with data:', pinData);
            if (!isLoggedIn) {
                console.log('✨ CREATE PIN - not logged in, throwing error');
                throw new Error('Authentication required');
            }

            const apiData = transformPinToAPI(pinData);
            console.log('✨ CREATE PIN - sending API data:', apiData);
            const response = await axios.post('travel-pins', apiData);
            console.log('✨ CREATE PIN - API response received:', response.data);
            return transformPinFromAPI(response.data.data);
        },
        onSuccess: (newPin) => {
            console.log('✨ CREATE PIN SUCCESS - new pin:', newPin);
            // Add the new pin to the cache
            queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
                console.log('✨ CREATE PIN - updating cache, oldData length:', oldData?.length);
                return oldData ? [...oldData, newPin] : [newPin];
            });

            // Invalidate and refetch
            console.log('✨ CREATE PIN - invalidating queries');
            queryClient.invalidateQueries(TRAVEL_PINS_QUERY_KEYS.lists());

            toast.success(intl.formatMessage({id: 'travel_pins.toast.pin_created'}));
        },
        onError: (error) => {
            console.error('Create travel pin error:', error);

            if (error.response?.status === 401) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.auth_required'}));
            } else if (error.response?.status === 422) {
                // Validation errors
                const errors = error.response.data.errors;
                if (errors) {
                    Object.values(errors).flat().forEach(message => {
                        toast.error(message);
                    });
                } else {
                    toast.error(intl.formatMessage({id: 'travel_pins.toast.validation_error'}));
                }
            } else {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.create_error'}));
            }
        }
    });
}

// Update Travel Pin (Authenticated, Owner only)
export function useUpdateTravelPin() {
    const queryClient = useQueryClient();
    const intl = useIntl();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const axios = useAxios();

    return useMutation({
        mutationFn: async ({id, pinData}) => {
            console.log('🔄 UPDATE PIN MUTATION - starting with id:', id, 'data:', pinData);
            if (!isLoggedIn) {
                console.log('🔄 UPDATE PIN - not logged in, throwing error');
                throw new Error('Authentication required');
            }

            const apiData = transformPinToAPI(pinData);
            console.log('🔄 UPDATE PIN - sending API data:', apiData);
            const response = await axios.put(`travel-pins/${id}`, apiData);
            console.log('🔄 UPDATE PIN - API response received:', response.data);
            return transformPinFromAPI(response.data.data);
        },
        onSuccess: (updatedPin) => {
            console.log('🔄 UPDATE PIN SUCCESS - updated pin:', updatedPin);
            // Update the pin in the cache
            queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
                console.log('🔄 UPDATE PIN - updating cache, oldData length:', oldData?.length);
                return oldData ? oldData.map(pin =>
                    pin.id === updatedPin.id ? updatedPin : pin
                ) : [updatedPin];
            });

            // Update individual pin cache if it exists
            queryClient.setQueryData(
                TRAVEL_PINS_QUERY_KEYS.detail(updatedPin.id),
                updatedPin
            );

            // Invalidate queries to ensure fresh data
            console.log('🔄 UPDATE PIN - invalidating detail queries');
            queryClient.invalidateQueries(TRAVEL_PINS_QUERY_KEYS.detail(updatedPin.id));

            toast.success(intl.formatMessage({id: 'travel_pins.toast.pin_updated'}));
        },
        onError: (error) => {
            console.error('Update travel pin error:', error);

            if (error.response?.status === 401) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.auth_required'}));
            } else if (error.response?.status === 403) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.unauthorized'}));
            } else if (error.response?.status === 404) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.pin_not_found'}));
            } else if (error.response?.status === 422) {
                // Validation errors
                const errors = error.response.data.errors;
                if (errors) {
                    Object.values(errors).flat().forEach(message => {
                        toast.error(message);
                    });
                } else {
                    toast.error(intl.formatMessage({id: 'travel_pins.toast.validation_error'}));
                }
            } else {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.update_error'}));
            }
        }
    });
}

// Delete Travel Pin (Authenticated, Owner only)
export function useDeleteTravelPin() {
    const queryClient = useQueryClient();
    const intl = useIntl();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const axios = useAxios();

    return useMutation({
        mutationFn: async (id) => {
            if (!isLoggedIn) {
                throw new Error('Authentication required');
            }

            await axios.delete(`travel-pins/${id}`);
            return {id};
        },
        onSuccess: ({id}) => {
            // Remove the pin from the cache
            queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
                return oldData ? oldData.filter(pin => pin.id !== id) : [];
            });

            // Remove individual pin cache
            queryClient.removeQueries(TRAVEL_PINS_QUERY_KEYS.detail(id));

            // Invalidate queries to ensure consistency
            queryClient.invalidateQueries(TRAVEL_PINS_QUERY_KEYS.lists());

            toast.success(intl.formatMessage({id: 'travel_pins.toast.pin_deleted'}));
        },
        onError: (error) => {
            console.error('Delete travel pin error:', error);

            if (error.response?.status === 401) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.auth_required'}));
            } else if (error.response?.status === 403) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.unauthorized'}));
            } else if (error.response?.status === 404) {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.pin_not_found'}));
            } else {
                toast.error(intl.formatMessage({id: 'travel_pins.toast.delete_error'}));
            }
        }
    });
}

// Optimistic update helper for better UX
export function useOptimisticTravelPinUpdate() {
    const queryClient = useQueryClient();

    const addOptimisticPin = (tempPin) => {
        queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
            const optimisticPin = {
                ...tempPin,
                id: `temp-${Date.now()}`, // Temporary ID
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            return oldData ? [...oldData, optimisticPin] : [optimisticPin];
        });
    };

    const removeOptimisticPin = (tempId) => {
        queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
            return oldData ? oldData.filter(pin => pin.id !== tempId) : [];
        });
    };

    const updateOptimisticPin = (id, updates) => {
        queryClient.setQueryData(TRAVEL_PINS_QUERY_KEYS.list(), (oldData) => {
            return oldData ? oldData.map(pin =>
                pin.id === id ? {...pin, ...updates} : pin
            ) : [];
        });
    };

    return {
        addOptimisticPin,
        removeOptimisticPin,
        updateOptimisticPin,
    };
}