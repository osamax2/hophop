import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for booking endpoints
 * Prevents abuse and automated booking attacks
 */
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 booking requests per windowMs
  message: {
    message: 'Too many booking attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests
  skipFailedRequests: false,
});

/**
 * Stricter rate limiter for guest bookings
 * Guest bookings are more susceptible to abuse
 */
export const guestBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 guest booking requests per hour
  message: {
    message: 'Too many guest booking attempts. Please sign in or try again later.',
    code: 'GUEST_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: true, // Don't count failed logins (only block on repeated failures)
});

/**
 * Rate limiter for registration
 * Prevents mass account creation
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: {
    message: 'Too many registration attempts. Please try again later.',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification resend
 * Prevents email spam
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 resend attempts per hour
  message: {
    message: 'Too many verification email requests. Please try again later.',
    code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Applies to all API routes as a baseline protection
 */
export const apiLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds (very short window for fast recovery)
  max: 100, // limit each IP to 100 requests per 10 seconds (600 req/min)
  message: {
    message: 'Too many requests. Please try again later.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
