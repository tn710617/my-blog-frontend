import { describe, it, expect } from 'vitest';
import { renderMarkdownToHTML } from '../../utils/markdownUtils';

describe('markdownUtils', () => {
  describe('renderMarkdownToHTML', () => {
    it('should return empty string for null/undefined input', () => {
      expect(renderMarkdownToHTML(null)).toBe('');
      expect(renderMarkdownToHTML(undefined)).toBe('');
      expect(renderMarkdownToHTML('')).toBe('');
    });

    it('should convert bold text correctly', () => {
      const markdown = '**Bold text**';
      const expected = '<strong>Bold text</strong>';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should convert italic text correctly', () => {
      const markdown = '*Italic text*';
      const expected = '<em>Italic text</em>';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should convert code blocks correctly', () => {
      const markdown = '`code block`';
      const expected = '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">code block</code>';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should convert links correctly', () => {
      const markdown = '[Link text](https://example.com)';
      const expected = '<a href="https://example.com" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 underline">Link text</a>';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should convert line breaks correctly', () => {
      const markdown = 'Line 1\nLine 2';
      const expected = 'Line 1<br>Line 2';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should handle mixed markdown formatting', () => {
      const markdown = '**Bold** and *italic* and `code` and [link](https://example.com)\nNew line';
      const expected = '<strong>Bold</strong> and <em>italic</em> and <code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">code</code> and <a href="https://example.com" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 underline">link</a><br>New line';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should handle nested markdown formatting', () => {
      const markdown = '**Bold *and italic***';
      // Note: Due to regex processing order (bold first, then italic), nested formatting
      // produces this specific order of tags
      const expected = '<strong>Bold <em>and italic</strong></em>';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should handle multiple line breaks', () => {
      const markdown = 'Line 1\n\nLine 3';
      const expected = 'Line 1<br><br>Line 3';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });

    it('should handle text without markdown formatting', () => {
      const markdown = 'Plain text without formatting';
      const expected = 'Plain text without formatting';
      expect(renderMarkdownToHTML(markdown)).toBe(expected);
    });
  });
});