// Simple controller to allow non-map components (e.g., overlay) to close the display popup
let closeFn = null;

export const setDisplayPopupCloser = (fn) => {
  closeFn = typeof fn === 'function' ? fn : null;
};

export const clearDisplayPopupCloser = () => {
  closeFn = null;
};

export const closeDisplayPopup = () => {
  if (closeFn) {
    try { closeFn(); } catch {}
  }
};

