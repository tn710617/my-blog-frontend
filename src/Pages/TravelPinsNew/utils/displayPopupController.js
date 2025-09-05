// Simple controller to allow non-map components (e.g., overlay) to close the display popup
let closeFn = null;
let openFn = null;

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

export const setDisplayPopupOpener = (fn) => {
  openFn = typeof fn === 'function' ? fn : null;
};

export const openDisplayPopup = (pin) => {
  if (openFn) {
    try { openFn(pin); } catch {}
  }
};
