// Centralized map interaction control for TravelPinsNew
// Provides consistent helpers for enabling/disabling interactions,
// cooperative gestures setup, and pass-through behavior.

const safeCall = (fn) => {
  try { return fn && fn(); } catch { return undefined; }
};

export const enableAll = (map) => {
  if (!map) return;
  safeCall(() => map.keyboard?.enable?.());
  safeCall(() => map.dragPan?.enable?.());
  safeCall(() => map.scrollZoom?.enable?.());
  safeCall(() => map.boxZoom?.enable?.());
  safeCall(() => map.doubleClickZoom?.enable?.());
  safeCall(() => map.touchZoomRotate?.enable?.());
  safeCall(() => map.dragRotate?.enable?.());
};

export const disableAll = (map) => {
  if (!map) return;
  safeCall(() => map.keyboard?.disable?.());
  safeCall(() => map.dragPan?.disable?.());
  safeCall(() => map.scrollZoom?.disable?.());
  safeCall(() => map.boxZoom?.disable?.());
  safeCall(() => map.doubleClickZoom?.disable?.());
  safeCall(() => map.touchZoomRotate?.disable?.());
  safeCall(() => map.dragRotate?.disable?.());
};
