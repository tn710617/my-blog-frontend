import React from 'react';

const ErrorIndicator = ({ error, message = "Failed to load pins" }) => {
  if (!error) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-lg z-10">
      <div className="flex items-center gap-2 text-red-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default ErrorIndicator;