import { customPopupStyles } from './popupStyles';

/**
 * Injects custom popup styles into the document head
 * @returns {Function} Cleanup function to remove the injected styles
 */
export const injectTravelPinsStyles = () => {
  const styleId = 'travel-pins-popup-styles';
  
  // Check if styles are already injected
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = customPopupStyles;
    document.head.appendChild(style);
  }
  
  // Return cleanup function
  return () => {
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
  };
};