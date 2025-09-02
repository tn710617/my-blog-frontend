import { describe, it, expect } from 'vitest';
import { customPopupStyles } from '../../utils/popupStyles';

describe('popupStyles', () => {
  describe('customPopupStyles', () => {
    it('should be a string', () => {
      expect(typeof customPopupStyles).toBe('string');
    });

    it('should contain auth button visibility classes', () => {
      expect(customPopupStyles).toContain('.auth-buttons-visible');
      expect(customPopupStyles).toContain('.auth-buttons-hidden');
      expect(customPopupStyles).toContain('display: block !important');
      expect(customPopupStyles).toContain('display: none !important');
    });

    it('should contain travel pin popup content styles', () => {
      expect(customPopupStyles).toContain('.travel-pin-popup .mapboxgl-popup-content');
      expect(customPopupStyles).toContain('padding: 0 !important');
      expect(customPopupStyles).toContain('border-radius: 0 !important');
      expect(customPopupStyles).toContain('background: transparent !important');
    });

    it('should contain close button styles', () => {
      expect(customPopupStyles).toContain('.travel-pin-popup .mapboxgl-popup-close-button');
      expect(customPopupStyles).toContain('display: none !important');
    });

    it('should contain popup tip styles', () => {
      expect(customPopupStyles).toContain('.travel-pin-popup .mapboxgl-popup-tip');
      expect(customPopupStyles).toContain('border-top-color: rgb(99 102 241) !important');
    });

    it('should contain centered popup styles', () => {
      expect(customPopupStyles).toContain('.travel-pin-popup-center');
      expect(customPopupStyles).toContain('position: fixed !important');
      expect(customPopupStyles).toContain('top: 50% !important');
      expect(customPopupStyles).toContain('left: 50% !important');
      expect(customPopupStyles).toContain('transform: translate(-50%, -50%) !important');
      expect(customPopupStyles).toContain('z-index: 1000 !important');
    });

    it('should contain responsive styles', () => {
      expect(customPopupStyles).toContain('max-height: 90vh !important');
      expect(customPopupStyles).toContain('max-width: 90vw !important');
      expect(customPopupStyles).toContain('overflow-y: auto !important');
      expect(customPopupStyles).toContain('-webkit-overflow-scrolling: touch !important');
    });

    it('should contain animation styles', () => {
      expect(customPopupStyles).toContain('.animate-scale-up');
      expect(customPopupStyles).toContain('animation: scaleUp 0.2s ease-out');
      expect(customPopupStyles).toContain('@keyframes scaleUp');
      expect(customPopupStyles).toContain('transform: scale(0.95)');
      expect(customPopupStyles).toContain('opacity: 0');
    });

    it('should have proper CSS syntax', () => {
      // Check that braces are balanced
      const openBraces = (customPopupStyles.match(/\{/g) || []).length;
      const closeBraces = (customPopupStyles.match(/\}/g) || []).length;
      expect(openBraces).toBe(closeBraces);

      // Check that it contains CSS selectors
      expect(customPopupStyles).toMatch(/\.[a-zA-Z-]+/); // Contains class selectors
      expect(customPopupStyles).toMatch(/:\s*[^;]+\s*!important/); // Contains important declarations
    });

    it('should not be empty', () => {
      expect(customPopupStyles.trim().length).toBeGreaterThan(0);
    });
  });
});