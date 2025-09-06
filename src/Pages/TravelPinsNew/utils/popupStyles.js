/**
 * Modern popup styles for Travel Pins New
 * Clean, minimal design with CSS-in-JS approach
 */

import { Z_INDEX } from './zIndex';

export const POPUP_STYLES = `
  /* Modern Travel Pin Popup Styles */
  .mapboxgl-popup { z-index: ${Z_INDEX.POPUP} !important; }
  .travel-pin-popup-modern {
    width: clamp(320px, 90vw, 420px);
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Header */
  .popup-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .popup-title-section {
    flex: 1;
    min-width: 0;
  }

  .popup-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    word-wrap: break-word;
  }

  .popup-date {
    margin: 8px 0 0 0;
    font-size: 0.875rem;
    opacity: 0.9;
    font-weight: 400;
  }

  .popup-close-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .popup-close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  /* Content */
  .popup-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .popup-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .popup-section-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .popup-section-icon {
    font-size: 1rem;
  }

  /* Notes */
  .popup-notes {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #475569;
  }

  /* Headings inside notes (markdown) */
  .popup-notes h1, .popup-notes h2, .popup-notes h3,
  .popup-notes h4, .popup-notes h5, .popup-notes h6 {
    margin: 0.25rem 0 0.5rem 0;
    font-weight: 700;
    color: #0f172a;
  }
  .popup-notes h1 { font-size: 1.375rem; }
  .popup-notes h2 { font-size: 1.25rem; }
  .popup-notes h3 { font-size: 1.125rem; }
  .popup-notes h4 { font-size: 1rem; }
  .popup-notes h5 { font-size: 0.9375rem; }
  .popup-notes h6 { font-size: 0.875rem; }

  .popup-notes p { margin: 0 0 12px 0; }

  .popup-notes p {
    margin: 0 0 12px 0;
  }

  .popup-notes p:last-child {
    margin-bottom: 0;
  }

  /* Photo */
  .popup-photo {
    position: relative;
  }

  .popup-photo-btn {
    width: 100%;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: block;
  }

  .popup-photo-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .popup-photo-btn:hover .popup-photo-img {
    transform: scale(1.02);
  }

  .popup-photo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
  }

  .popup-photo-btn:hover .popup-photo-overlay {
    opacity: 1;
  }

  /* Actions */
  .popup-actions {
    padding: 20px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    background: #fafbfc;
  }

  .popup-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    outline: none;
    min-height: 40px;
  }

  .popup-btn:focus-visible {
    ring: 2px solid #3b82f6;
    ring-offset: 2px;
  }

  /* Button variants */
  .popup-btn-secondary {
    background: white;
    color: #475569;
    border-color: #d1d5db;
  }

  .popup-btn-secondary:hover {
    background: #f8fafc;
    border-color: #9ca3af;
  }

  .popup-btn-primary {
    background: #3b82f6;
    color: white;
  }

  .popup-btn-primary:hover {
    background: #2563eb;
  }

  .popup-btn-danger {
    background: #ef4444;
    color: white;
  }

  .popup-btn-danger:hover {
    background: #dc2626;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .travel-pin-popup-modern {
      width: calc(100vw - 32px);
      max-width: 100%;
    }

    .popup-header {
      padding: 16px;
    }

    .popup-title {
      font-size: 1.125rem;
    }

    .popup-content {
      padding: 16px;
      gap: 16px;
    }

    .popup-actions {
      padding: 16px;
      flex-direction: column;
    }

    .popup-btn {
      width: 100%;
      justify-content: center;
    }

    .popup-photo-img {
      height: 160px;
    }
  }

  /* Remove default Mapbox popup styles */
  .mapboxgl-popup-content {
    padding: 0 !important;
    border-radius: 16px !important;
  }

  .mapboxgl-popup-tip {
    display: none;
  }
`;

/**
 * Inject popup styles into the page
 * @returns {Function} Cleanup function to remove styles
 */
export function injectPopupStyles() {
  const styleId = 'travel-pins-new-popup-styles';
  
  // Don't inject if already exists
  if (document.getElementById(styleId)) {
    return () => {};
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = POPUP_STYLES;
  document.head.appendChild(style);

  // Return cleanup function
  return () => {
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
  };
}
