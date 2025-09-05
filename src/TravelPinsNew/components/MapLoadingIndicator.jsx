import React from 'react';
import { useMapStore } from '../stores/mapStore';

const MapLoadingIndicator = () => {
  const { isMapReady, mapError } = useMapStore();

  // Don't show anything if map is ready
  if (isMapReady) {
    return null;
  }

  // Show error state
  if (mapError) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Map Load Error
          </h3>
          <p className="text-gray-600 mb-4">
            {mapError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Loading Map
        </h3>
        <p className="text-gray-600">
          Preparing your global view...
        </p>
      </div>
    </div>
  );
};

export default MapLoadingIndicator;