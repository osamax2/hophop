import validator from 'validator';
import xss from 'xss';

/**
 * Sanitize string input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  // Use xss library to remove malicious content
  return xss(input.trim(), {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
}

/**
 * Sanitize and validate email
 * @param email - Email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;
  const sanitized = email.trim().toLowerCase();
  return validator.isEmail(sanitized) ? sanitized : null;
}

/**
 * Sanitize phone number
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  // Remove all non-digit, non-plus, non-dash characters
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize and validate URL
 * @param url - URL to validate and sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeURL(url: string): string | null {
  if (typeof url !== 'string') return null;
  const sanitized = url.trim();
  
  // Validate URL
  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    return null;
  }
  
  return sanitized;
}

/**
 * Sanitize numeric input
 * @param input - Input to convert to number
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(input: any): number | null {
  if (typeof input === 'number' && !isNaN(input)) return input;
  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Sanitize integer input
 * @param input - Input to convert to integer
 * @returns Sanitized integer or null if invalid
 */
export function sanitizeInteger(input: any): number | null {
  if (typeof input === 'number' && Number.isInteger(input)) return input;
  if (typeof input === 'string') {
    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Sanitize boolean input
 * @param input - Input to convert to boolean
 * @returns Boolean value
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  if (typeof input === 'number') {
    return input === 1;
  }
  return false;
}

/**
 * Sanitize date input
 * @param date - Date string to validate
 * @returns Sanitized date or null if invalid
 */
export function sanitizeDate(date: string): Date | null {
  if (typeof date !== 'string') return null;
  if (!validator.isISO8601(date)) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Sanitize array of strings
 * @param arr - Array to sanitize
 * @returns Sanitized array
 */
export function sanitizeArray(arr: any[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize object - recursively sanitize all string values
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value) as any;
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value) as any;
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    }
  }
  
  return sanitized;
}

/**
 * Validate CR number (Commercial Registration) format
 * @param crNumber - CR number to validate
 * @returns True if valid format
 */
export function validateCRNumber(crNumber: string): boolean {
  if (typeof crNumber !== 'string') return false;
  // CR number should be 10 digits
  return /^\d{10}$/.test(crNumber);
}

/**
 * Escape SQL LIKE pattern special characters
 * Note: This is additional protection. Always use parameterized queries!
 * @param pattern - Pattern to escape
 * @returns Escaped pattern
 */
export function escapeLikePattern(pattern: string): string {
  if (typeof pattern !== 'string') return '';
  return pattern.replace(/[%_]/g, '\\$&');
}
