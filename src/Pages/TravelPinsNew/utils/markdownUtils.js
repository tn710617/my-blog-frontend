// Markdown utilities for Travel Pins New
// Lightweight renderer with broader feature support, no external deps.
// Choices:
// - Disallow raw HTML (escape it) to avoid XSS in user notes.
// - Allow links/images with protocol whitelist (http/https/mailto/tel).
// - Support: headings, hr, blockquote, lists (flat), paragraphs, inline bold/italic/del, inline code, links/images, autolinks, fenced code blocks (no highlight).

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const sanitizeUrl = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    const ok = ['http:', 'https:', 'mailto:', 'tel:'];
    return ok.includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};

const renderInline = (text) => {
  if (!text) return '';
  // Escape HTML first; code spans will be re-escaped inside
  let t = escapeHtml(text);

  // Inline code: protect content by special wrapper during other replacements
  const codeBuckets = [];
  t = t.replace(/`([^`]+)`/g, (_m, code) => {
    const idx = codeBuckets.push(code) - 1;
    return `__CODE_SPAN_${idx}__`;
  });

  // Images ![alt](url)
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_m, alt, url) => {
    const safe = sanitizeUrl(url);
    if (!safe) return escapeHtml(alt || '');
    return `<img src="${safe}" alt="${escapeHtml(alt || '')}" style="max-width:100%;height:auto;border-radius:8px"/>`;
  });

  // Links [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_m, label, url) => {
    const safe = sanitizeUrl(url);
    const textEsc = escapeHtml(label);
    if (!safe) return textEsc;
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 hover:text-blue-800 underline">${textEsc}</a>`;
  });

  // Autolink bare URLs
  t = t.replace(/(^|\s)(https?:\/\/[^\s<]+)(?=$|\s)/g, (_m, pre, url) => {
    const safe = sanitizeUrl(url);
    if (!safe) return pre + escapeHtml(url);
    return `${pre}<a href="${safe}" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 hover:text-blue-800 underline">${escapeHtml(url)}</a>`;
  });

  // Strong, Emphasis, Strikethrough (simple, non-nested-safe)
  t = t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Restore code spans (escaped inside <code>)
  t = t.replace(/__CODE_SPAN_(\d+)__/g, (_m, i) => `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${escapeHtml(codeBuckets[Number(i)])}</code>`);

  return t;
};

export const markdownToHtml = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return '';

  const src = markdown.replace(/\r\n?/g, '\n');
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  const nextNonEmpty = () => {
    while (i < lines.length && lines[i].trim() === '') i++;
  };

  while (i < lines.length) {
    // Fenced code block ```lang\n...\n```
    const fence = lines[i].match(/^\s*```([a-z0-9+-]*)\s*$/i);
    if (fence) {
      const codeLines = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      const code = escapeHtml(codeLines.join('\n'));
      out.push(`<pre class="bg-gray-900/95 text-gray-100 rounded-lg p-4 overflow-auto"><code>${code}</code></pre>`);
      nextNonEmpty();
      continue;
    }

    // Horizontal rule
    if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
      out.push('<hr />');
      i++;
      nextNonEmpty();
      continue;
    }

    // Heading
    const h = lines[i].match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${renderInline(h[2].trim())}</h${level}>`);
      i++;
      nextNonEmpty();
      continue;
    }

    // Blockquote (single level)
    if (/^\s*>\s?/.test(lines[i])) {
      const bq = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        bq.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      const inner = bq.join('\n');
      out.push(`<blockquote style="border-left:4px solid #e5e7eb;padding:8px 12px;color:#374151;background:#f9fafb;border-radius:6px">${markdownToHtml(inner)}</blockquote>`);
      nextNonEmpty();
      continue;
    }

    // Lists (flat)
    const ulMarker = lines[i].match(/^\s*([-*+])\s+(.+)$/);
    const olMarker = lines[i].match(/^\s*(\d+)\.\s+(.+)$/);
    if (ulMarker || olMarker) {
      const isOl = Boolean(olMarker);
      const tag = isOl ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length) {
        const m = isOl
          ? lines[i].match(/^\s*\d+\.\s+(.+)$/)
          : lines[i].match(/^\s*[-*+]\s+(.+)$/);
        if (!m) break;
        items.push(`<li>${renderInline(m[1].trim())}</li>`);
        i++;
      }
      out.push(`<${tag} style="padding-left:1.25rem;list-style:${isOl ? 'decimal' : 'disc'};margin:0.5rem 0">${items.join('')}</${tag}>`);
      nextNonEmpty();
      continue;
    }

    // Paragraph: collect until blank line or block token
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^\s*```/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(lines[i]) && !/^\s{0,3}(?:#{1,6}|-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) {
      out.push(`<p>${renderInline(buf.join(' '))}</p>`);
      nextNonEmpty();
      continue;
    }

    // Fallback: skip unknown/empty
    i++;
  }

  return out.join('\n');
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
