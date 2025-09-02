import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPopupHTML } from '../popupHtml';

describe('buildPopupHTML', () => {
  const mockContext = {
    t: vi.fn((key) => `translated_${key}`),
    formatDate: vi.fn((date) => `formatted_${date}`),
    renderMarkdownToHTML: vi.fn((markdown) => `<p>rendered_${markdown}</p>`),
    isMobile: false,
    isLoggedIn: true,
    popupId: 'test-popup'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const basicPin = {
    id: 1,
    title: 'Test Pin',
    coordinates: [121.5, 25.0],
    note: null,
    visited_at: null,
    photo_url: null,
    photos: []
  };

  it('should render basic popup with title only', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).toContain('Test Pin');
    expect(html).toContain('id="test-popup"');
    expect(html).toContain('data-action="close"');
    expect(html).toContain('data-action="copy"');
    expect(html).toContain('id="copy-btn-1"');
  });

  it('should include visited date when present', () => {
    const pinWithDate = { ...basicPin, visited_at: '2024-03-15' };
    
    const html = buildPopupHTML(pinWithDate, mockContext);

    expect(html).toContain('translated_travel_pins.popup.visited');
    expect(html).toContain('formatted_2024-03-15');
    expect(mockContext.formatDate).toHaveBeenCalledWith('2024-03-15');
  });

  it('should not include visited date section when null', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).not.toContain('translated_travel_pins.popup.visited');
    expect(mockContext.formatDate).not.toHaveBeenCalled();
  });

  it('should include note section when present', () => {
    const pinWithNote = { ...basicPin, note: 'This is my travel note' };
    
    const html = buildPopupHTML(pinWithNote, mockContext);

    expect(html).toContain('translated_travel_pins.popup.travel_notes');
    expect(html).toContain('<p>rendered_This is my travel note</p>');
    expect(mockContext.renderMarkdownToHTML).toHaveBeenCalledWith('This is my travel note');
  });

  it('should not include note section when null', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).not.toContain('translated_travel_pins.popup.travel_notes');
    expect(mockContext.renderMarkdownToHTML).not.toHaveBeenCalled();
  });

  it('should include photo section when present', () => {
    const pinWithPhoto = { ...basicPin, photo_url: 'https://example.com/photo.jpg' };
    
    const html = buildPopupHTML(pinWithPhoto, mockContext);

    expect(html).toContain('translated_travel_pins.popup.photo');
    expect(html).toContain('src="https://example.com/photo.jpg"');
    expect(html).toContain('alt="Test Pin"');
    expect(html).toContain('data-action="open-photo"');
    expect(html).toContain('onerror="this.style.display=\'none\';');
    expect(html).toContain('translated_travel_pins.popup.image_not_available');
  });

  it('should not include photo section when null', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).not.toContain('translated_travel_pins.popup.photo');
    expect(html).not.toContain('data-action="open-photo"');
  });

  it('should include attachments section when photos array has items', () => {
    const pinWithAttachments = { 
      ...basicPin, 
      photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'] 
    };
    
    const html = buildPopupHTML(pinWithAttachments, mockContext);

    expect(html).toContain('translated_travel_pins.popup.attachments');
    expect(html).toContain('3 photos attached');
  });

  it('should use singular form for single photo attachment', () => {
    const pinWithOnePhoto = { ...basicPin, photos: ['photo1.jpg'] };
    
    const html = buildPopupHTML(pinWithOnePhoto, mockContext);

    expect(html).toContain('1 photo attached');
    expect(html).not.toContain('photos attached');
  });

  it('should not include attachments section when photos array is empty', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).not.toContain('translated_travel_pins.popup.attachments');
    expect(html).not.toContain('attached');
  });

  it('should include copy button with correct attributes', () => {
    const html = buildPopupHTML(basicPin, mockContext);

    expect(html).toContain('data-action="copy"');
    expect(html).toContain('id="copy-btn-1"');
    expect(html).toContain('translated_travel_pins.popup.copy_location');
  });

  it('should show auth buttons container when logged in', () => {
    const loggedInContext = { ...mockContext, isLoggedIn: true };
    
    const html = buildPopupHTML(basicPin, loggedInContext);

    expect(html).toContain('auth-buttons-container auth-buttons-visible');
    expect(html).toContain('data-action="delete"');
    expect(html).toContain('data-action="edit"');
    expect(html).toContain('translated_travel_pins.popup.delete_button');
    expect(html).toContain('translated_travel_pins.popup.edit_button');
  });

  it('should hide auth buttons container when not logged in', () => {
    const loggedOutContext = { ...mockContext, isLoggedIn: false };
    
    const html = buildPopupHTML(basicPin, loggedOutContext);

    expect(html).toContain('auth-buttons-container auth-buttons-hidden');
    expect(html).toContain('data-action="delete"');
    expect(html).toContain('data-action="edit"');
  });

  it('should use mobile classes when isMobile is true', () => {
    const mobileContext = { ...mockContext, isMobile: true };
    
    const html = buildPopupHTML(basicPin, mobileContext);

    expect(html).toContain('w-[85vw] max-w-sm');
    expect(html).toContain('px-4 py-4');
    expect(html).toContain('p-4 space-y-4');
    expect(html).toContain('text-lg');
  });

  it('should use desktop classes when isMobile is false', () => {
    const desktopContext = { ...mockContext, isMobile: false };
    
    const html = buildPopupHTML(basicPin, desktopContext);

    expect(html).toContain('min-w-80 max-w-md');
    expect(html).toContain('px-6 py-5');
    expect(html).toContain('p-6 space-y-5');
    expect(html).toContain('text-xl');
  });

  it('should render all sections together correctly', () => {
    const fullPin = {
      id: 42,
      title: 'Complete Test Pin',
      note: 'Full markdown **note**',
      visited_at: '2024-12-25',
      photo_url: 'https://example.com/full.jpg',
      photos: ['attach1.jpg', 'attach2.jpg']
    };

    const html = buildPopupHTML(fullPin, mockContext);

    // Title and ID
    expect(html).toContain('Complete Test Pin');
    expect(html).toContain('id="copy-btn-42"');
    
    // Date section
    expect(html).toContain('translated_travel_pins.popup.visited');
    expect(html).toContain('formatted_2024-12-25');
    
    // Note section
    expect(html).toContain('translated_travel_pins.popup.travel_notes');
    expect(html).toContain('<p>rendered_Full markdown **note**</p>');
    
    // Photo section
    expect(html).toContain('translated_travel_pins.popup.photo');
    expect(html).toContain('src="https://example.com/full.jpg"');
    
    // Attachments section
    expect(html).toContain('translated_travel_pins.popup.attachments');
    expect(html).toContain('2 photos attached');
    
    // Action buttons
    expect(html).toContain('data-action="close"');
    expect(html).toContain('data-action="copy"');
    expect(html).toContain('data-action="edit"');
    expect(html).toContain('data-action="delete"');
  });

  it('should handle special characters in title and note', () => {
    const pinWithSpecialChars = {
      ...basicPin,
      title: 'Pin with <script>alert("xss")</script> & "quotes"',
      note: 'Note with <div>HTML</div> & special chars'
    };

    const html = buildPopupHTML(pinWithSpecialChars, mockContext);

    // Title should be included as-is (HTML context handles escaping)
    expect(html).toContain('Pin with <script>alert("xss")</script> & "quotes"');
    
    // Note gets processed through renderMarkdownToHTML mock
    expect(mockContext.renderMarkdownToHTML).toHaveBeenCalledWith('Note with <div>HTML</div> & special chars');
  });
});