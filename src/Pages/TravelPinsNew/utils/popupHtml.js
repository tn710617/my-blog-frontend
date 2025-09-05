/**
 * Modern, simplified popup HTML builder for Travel Pins New
 * Inspired by existing implementation but with cleaner, more maintainable design
 */

export function buildPopupHTML(pin, ctx) {
  const { t, formatDate, isLoggedIn, popupId, renderMarkdownToHTML } = ctx;
  
  return `
    <div id="${popupId}" class="travel-pin-popup-modern">
      <!-- Header -->
      <header class="popup-header">
        <div class="popup-title-section">
          <h3 class="popup-title">${pin.title}</h3>
          ${pin.visited_at ? `
            <p class="popup-date">📍 ${formatDate(pin.visited_at)}</p>
          ` : ''}
        </div>
        <button data-action="close" class="popup-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <!-- Content -->
      <div class="popup-content">
        ${buildNotesSection(pin, renderMarkdownToHTML, t)}
        ${buildPhotoSection(pin, t)}
      </div>

      <!-- Actions -->
      <footer class="popup-actions">
        <button data-action="copy" class="popup-btn popup-btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          ${t('travel_pins.popup.copy_link')}
        </button>
        
        ${isLoggedIn ? `
          <button data-action="edit" class="popup-btn popup-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            ${t('travel_pins.popup.edit_button')}
          </button>
          
          <button data-action="delete" class="popup-btn popup-btn-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"></path>
            </svg>
            ${t('travel_pins.popup.delete_button')}
          </button>
        ` : ''}
      </footer>
    </div>
  `;
}

function buildNotesSection(pin, renderMarkdownToHTML, t) {
  if (!pin.note) return '';
  
  return `
    <section class="popup-section">
      <h4 class="popup-section-title">
        <span class="popup-section-icon">📝</span>
        ${t('travel_pins.popup.travel_notes')}
      </h4>
      <div class="popup-notes">
        ${renderMarkdownToHTML(pin.note)}
      </div>
    </section>
  `;
}

function buildPhotoSection(pin, t) {
  if (!pin.photo_url) return '';
  
  return `
    <section class="popup-section">
      <h4 class="popup-section-title">
        <span class="popup-section-icon">📷</span>
        ${t('travel_pins.popup.photo')}
      </h4>
      <div class="popup-photo">
        <button data-action="photo" class="popup-photo-btn" aria-label="View photo">
          <img src="${pin.photo_url}" alt="${pin.title}" class="popup-photo-img" loading="lazy" />
          <div class="popup-photo-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </div>
        </button>
      </div>
    </section>
  `;
}