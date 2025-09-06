import { useState, useEffect, useRef } from 'react';

/**
 * Shared detector for mobile environment (non-hook, SSR-safe)
 * Combines viewport, input modality and UA heuristics,
 * including iPadOS (MacIntel + touch) in desktop-mode Safari.
 */
export const detectIsMobile = () => {
  if (typeof window === 'undefined') return false;

  // Viewport width heuristic
  const smallViewport = window.innerWidth <= 768;

  // Input modality heuristics
  const anyPointerCoarse = (() => {
    try { return window.matchMedia('(any-pointer: coarse)').matches; } catch { return false; }
  })();
  const hoverNone = (() => {
    try { return window.matchMedia('(any-hover: none)').matches; } catch { return false; }
  })();

  // Touch capability
  const hasTouch = typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;

  // UA heuristics (covers iPadOS which may present as Mac)
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isIPadOS = (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || /iPad/i.test(ua);
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(ua) || isIPadOS;

  // Final decision: UA OR (small viewport AND touch/coarse)
  return Boolean(
    isMobileUA ||
    (smallViewport && (hasTouch || anyPointerCoarse || hoverNone)) ||
    ((anyPointerCoarse || hoverNone) && hasTouch)
  );
};

/**
 * Hook for responsive/mobile detection with stable updates.
 * Uses detectIsMobile() and listens to resize + relevant media queries.
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(() => detectIsMobile());
  const frame = useRef(0);

  useEffect(() => {
    const update = () => {
      // rAF coalescing to avoid update storms
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setIsMobile(detectIsMobile()));
    };

    const mqls = [
      '(any-pointer: coarse)',
      '(any-hover: none)',
    ].map(q => {
      try { return window.matchMedia(q); } catch { return null; }
    }).filter(Boolean);

    window.addEventListener('resize', update);
    mqls.forEach(mql => mql.addEventListener?.('change', update));

    return () => {
      window.removeEventListener('resize', update);
      mqls.forEach(mql => mql.removeEventListener?.('change', update));
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return isMobile;
};
