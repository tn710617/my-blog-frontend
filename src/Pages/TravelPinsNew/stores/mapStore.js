import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Map state management for Travel Pins New
export const useMapStore = create(
  persist(
    (set, get) => ({
      // Map instance reference (not persisted)
      mapInstance: null,
      mapRootEl: null,
      
      // Map initialization state (not persisted)
      isMapReady: false,
      mapError: null,
      
      // Current map viewport (not persisted)
      viewport: {
        longitude: 0,
        latitude: 0,
        zoom: 1,
      },
      
      // Mobile gesture mode (persisted for user preference)
      isMobileGestureMode: 'rotate', // 'rotate' | 'scroll'
      
      // Set map instance
      setMapInstance: (map) => {
        set({ 
          mapInstance: map,
          isMapReady: !!map,
          mapError: null
        });
      },

      // Set the root element containing the map (for portals like overlay)
      setMapRootEl: (el) => {
        set({ mapRootEl: el || null });
      },
      
      // Set map error
      setMapError: (error) => {
        set({ 
          mapError: error,
          isMapReady: false
        });
      },
      
      // Update viewport
      setViewport: (viewport) => {
        set({ viewport });
      },
      
      // Toggle mobile gesture mode
      toggleMobileGestureMode: () => {
        const current = get().isMobileGestureMode;
        const next = current === 'rotate' ? 'scroll' : 'rotate';
        set({ isMobileGestureMode: next });
      },
      
      // Map interaction methods
      flyTo: (options) => {
        const map = get().mapInstance;
        if (map) {
          return map.flyTo(options);
        }
      },
      
      easeTo: (options) => {
        const map = get().mapInstance;
        if (map) {
          return map.easeTo(options);
        }
      },
      
      getZoom: () => {
        const map = get().mapInstance;
        return map ? map.getZoom() : 1;
      },
      
      getCenter: () => {
        const map = get().mapInstance;
        return map ? map.getCenter() : { lng: 0, lat: 0 };
      },
    }),
    {
      name: 'travel_pins_map_storage',
      // Only persist user preferences, not runtime state
      partialize: (state) => ({ 
        isMobileGestureMode: state.isMobileGestureMode 
      }),
    }
  )
);
