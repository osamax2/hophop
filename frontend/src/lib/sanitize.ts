import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param dirty - The potentially unsafe string
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
}

/**
 * Sanitize HTML content while preserving safe tags
 * Use this for rich text content where some HTML is allowed
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize email input
 * @param email - The email string to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  // Remove all HTML tags and trim
  const sanitized = sanitizeInput(email).trim().toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize phone number
 * @param phone - The phone number to sanitize
 * @returns Sanitized phone number (digits, +, -, spaces only)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all characters except digits, +, -, and spaces
  return phone.replace(/[^\d+\-\s]/g, '').trim();
}

/**
 * Validate and sanitize URL
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  try {
    const sanitized = sanitizeInput(url).trim();
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return sanitized;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Escape special characters for safe display in text
 * @param text - The text to escape
 * @returns Escaped text
 */
export function escapeText(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate and sanitize numeric input
 * @param value - The value to sanitize
 * @returns Sanitized number or 0 if invalid
 */
export function sanitizeNumber(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitize array of strings
 * @param arr - Array of strings to sanitize
 * @returns Sanitized array
 */
export function sanitizeArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => sanitizeInput(String(item))).filter(Boolean);
}
