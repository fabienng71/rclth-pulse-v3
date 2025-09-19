import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks while preserving basic formatting
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Configure DOMPurify to allow basic formatting tags
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
      'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    STRIP_COMMENTS: true
  };
  
  return DOMPurify.sanitize(html, config);
};

/**
 * Convert HTML to plain text for cases where HTML rendering is not needed
 */
export const htmlToText = (html: string): string => {
  if (!html) return '';
  
  // Strip all HTML tags and decode entities
  const stripped = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  
  // Replace multiple whitespace with single space and trim
  return stripped.replace(/\s+/g, ' ').trim();
};

/**
 * Safe HTML component for rendering sanitized HTML content
 */
export const SafeHtml: React.FC<{ 
  content: string; 
  className?: string; 
  fallbackToText?: boolean;
}> = ({ content, className = '', fallbackToText = true }) => {
  if (!content) return null;
  
  try {
    const sanitized = sanitizeHtml(content);
    
    // If sanitization resulted in empty content and fallback is enabled, show as text
    if (!sanitized.trim() && fallbackToText) {
      return <span className={className}>{htmlToText(content)}</span>;
    }
    
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  } catch (error) {
    console.warn('HTML sanitization failed:', error);
    
    // Fallback to plain text if sanitization fails
    if (fallbackToText) {
      return <span className={className}>{htmlToText(content)}</span>;
    }
    
    return null;
  }
};