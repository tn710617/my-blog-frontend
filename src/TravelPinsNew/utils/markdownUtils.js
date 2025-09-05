// Markdown utilities for Travel Pins New
// Handles safe markdown-to-HTML conversion with XSS protection

// Escape HTML characters to prevent XSS
const escapeHtml = (text) => {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
};

// Validate and sanitize URLs
const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Invalid URL
  }
  return null;
};

// Convert markdown to safe HTML (based on existing implementation but with better security)
export const markdownToHtml = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  // Escape HTML first to prevent XSS
  let html = escapeHtml(markdown);
  
  // Apply markdown transformations (order matters)
  html = html
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text (after bold to avoid conflicts)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code spans
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links with URL sanitization
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const sanitizedUrl = sanitizeUrl(url);
      if (sanitizedUrl) {
        return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
      }
      return text; // If URL is invalid, just show the text
    })
    // Line breaks
    .replace(/\n/g, '<br>');
    
  return html;
};

// Check if text contains markdown formatting
export const hasMarkdownFormatting = (text) => {
  if (!text) return false;
  
  const markdownPatterns = [
    /\*\*.*?\*\*/, // Bold
    /\*.*?\*/, // Italic
    /`.*?`/, // Inline code
    /\[.*?\]\(.*?\)/, // Links
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

// Preview markdown formatting (for form preview)
export const getMarkdownPreview = (text, maxLength = 100) => {
  if (!text) return '';
  
  const html = markdownToHtml(text);
  const plainText = html.replace(/<[^>]*>/g, ''); // Strip HTML tags for preview
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength) + '...';
};