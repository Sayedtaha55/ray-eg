import DOMPurify from 'dompurify';

/**
 * تنظيف أي HTML قادم من مستخدمين/بيانات خارجية قبل حقنه في الصفحة (حماية من XSS).
 * يُستخدم مع dangerouslySetInnerHTML فقط.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'em', 'strong', 'u', 's', 'p', 'div', 'span', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
      'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'video', 'source', 'iframe', 'button', 'input', 'select', 'option', 'label',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel',
      'width', 'height', 'type', 'placeholder', 'value', 'name', 'controls', 'colspan', 'rowspan',
    ],
    ADD_ATTR: ['target', 'rel'],
  });
}