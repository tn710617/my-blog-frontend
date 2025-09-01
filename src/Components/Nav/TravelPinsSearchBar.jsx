import React, { useState, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import mapboxgl from 'mapbox-gl';

// Debounce utility
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
};

export default function TravelPinsSearchBar({ onLocationSelect }) {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Helper function to get translated text
  const t = (key) => intl.formatMessage({id: key});

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxgl.accessToken}&` +
          `types=country,place&` +
          `limit=6&` +
          `autocomplete=true`
        );
        
        const data = await response.json();
        setSearchSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  // Handle suggestion selection
  const handleLocationSelect = (suggestion) => {
    setSearchQuery(suggestion.place_name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onLocationSelect) {
      onLocationSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          handleLocationSelect(searchSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle focus and blur
  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Keyboard shortcut (Ctrl/Cmd + F)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Modern Search Input */}
      <div className={`relative flex items-center transition-all duration-300 rounded-2xl ${
        isFocused 
          ? 'shadow-lg shadow-blue-500/25 scale-105' 
          : 'shadow-md hover:shadow-lg'
      }`}>
        <div className={`flex items-center w-full transition-all duration-300 ${
          isFocused 
            ? 'bg-white border-2 border-blue-400 ring-4 ring-blue-100 rounded-2xl' 
            : 'bg-white/95 backdrop-blur-sm border border-gray-200 hover:border-gray-300 rounded-2xl'
        }`}>
          {/* Search Icon */}
          <div className={`flex items-center justify-center w-12 h-12 transition-colors duration-300 ${
            isFocused ? 'text-blue-500' : 'text-gray-400'
          }`}>
            {isSearching ? (
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
              </svg>
            )}
          </div>

          {/* Input Field */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t('travel_pins.search.placeholder')}
            className="flex-1 px-2 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-300 text-sm font-medium"
            style={{ fontSize: '16px' }}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className={`flex items-center justify-center w-10 h-10 mr-1 rounded-full transition-all duration-200 ${
                isFocused 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Modern Suggestions Dropdown */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 backdrop-blur-sm"
          style={{ minWidth: '320px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('travel_pins.search.countries')}
              </span>
              <span className="text-xs text-gray-400">
                {searchSuggestions.length} results
              </span>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="max-h-80 overflow-y-auto">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.id}-${index}`}
                onClick={() => handleLocationSelect(suggestion)}
                className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                  index === selectedIndex
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400'
                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-l-4 border-transparent'
                } ${index !== searchSuggestions.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Location Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                  index === selectedIndex
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {suggestion.place_type?.includes('country') ? '🌍' : '📍'}
                </div>

                {/* Location Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate transition-colors duration-200 ${
                    index === selectedIndex ? 'text-blue-900' : 'text-gray-800'
                  }`}>
                    {suggestion.text}
                  </p>
                  <p className={`text-xs truncate transition-colors duration-200 ${
                    index === selectedIndex ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {suggestion.place_name}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className={`transition-all duration-200 ${
                  index === selectedIndex ? 'text-blue-500 transform translate-x-1' : 'text-gray-300'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 text-center">
              Use ↑↓ to navigate • Enter to select • Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}