import React from 'react';

const LoadingIndicator = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-10">
      <div className="flex items-center gap-2 text-slate-700">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Loading pins...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;