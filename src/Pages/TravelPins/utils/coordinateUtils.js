/**
 * Handles copying coordinates to clipboard with visual feedback
 * @param {Array} coordinates - Array of [lng, lat]
 * @param {string} pinId - ID of the pin (for popup button feedback)
 * @param {Function} t - Translation function
 * @param {Function} setCoordsCopied - Setter for fallback copied state
 * @returns {Promise<void>}
 */
export const handleCopyCoordinates = async (coordinates, pinId, t, setCoordsCopied) => {
  const coordText = `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
  
  // Get the button element if pinId is provided (for popup buttons)
  const buttonElement = pinId ? document.getElementById(`copy-btn-${pinId}`) : null;
  
  try {
    await navigator.clipboard.writeText(coordText);
    showCopySuccess(buttonElement, t, setCoordsCopied);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = coordText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopySuccess(buttonElement, t, setCoordsCopied);
  }
};

/**
 * Shows visual feedback for successful copy operation
 * @param {HTMLElement} buttonElement - The button that was clicked
 * @param {Function} t - Translation function
 * @param {Function} setCoordsCopied - Setter for fallback copied state
 */
const showCopySuccess = (buttonElement, t, setCoordsCopied) => {
  if (buttonElement) {
    // Store original content
    const originalContent = buttonElement.innerHTML;
    
    // Show success state
    buttonElement.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span class="text-sm font-medium">${t('travel_pins.popup.copied')}</span>
    `;
    buttonElement.className = buttonElement.className.replace(
      'from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border-emerald-200 hover:border-emerald-300',
      'from-green-100 to-emerald-100 text-green-700 border-green-300'
    );
    
    // Restore original after 2 seconds
    setTimeout(() => {
      buttonElement.innerHTML = originalContent;
      buttonElement.className = buttonElement.className.replace(
        'from-green-100 to-emerald-100 text-green-700 border-green-300',
        'from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-emerald-700 border-emerald-200 hover:border-emerald-300'
      );
    }, 2000);
  } else {
    // Fallback for non-popup buttons
    setCoordsCopied(true);
    setTimeout(() => setCoordsCopied(false), 2000);
  }
};