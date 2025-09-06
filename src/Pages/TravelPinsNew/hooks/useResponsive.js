import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive breakpoint detection
 * Provides consistent mobile/desktop detection across components
 * Updates dynamically when window size changes
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Handle SSR/initial render safely
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};