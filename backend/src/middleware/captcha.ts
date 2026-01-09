import { Request, Response, NextFunction } from 'express';
import https from 'https';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify Google reCAPTCHA v3 token
 * @param token - The reCAPTCHA token from the client
 * @param remoteip - The user's IP address
 * @returns Promise with verification result
 */
export async function verifyRecaptcha(token: string, remoteip?: string): Promise<RecaptchaResponse> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('⚠️ RECAPTCHA_SECRET_KEY not configured - skipping verification');
    // In development/testing, allow requests if no secret is configured
    return { success: true, score: 1.0 };
  }

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteip && { remoteip })
    }).toString();

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data) as RecaptchaResponse;
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse reCAPTCHA response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Middleware to verify reCAPTCHA v3 token for guest bookings
 * Requires a minimum score of 0.5 (configurable)
 */
export const verifyCaptchaForGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip verification for authenticated users
  const isAuthenticated = !!(req as any).user;
  if (isAuthenticated) {
    return next();
  }

  // Get captcha token from request body
  const captchaToken = req.body.captcha_token;

  if (!captchaToken) {
    return res.status(400).json({
      message: 'Captcha verification required for guest bookings',
      code: 'CAPTCHA_REQUIRED'
    });
  }

  try {
    // Get user's IP address
    const userIp = req.ip || req.socket.remoteAddress;
    
    // Verify the captcha token
    const verification = await verifyRecaptcha(captchaToken, userIp);

    if (!verification.success) {
      console.warn('❌ reCAPTCHA verification failed:', verification['error-codes']);
      return res.status(400).json({
        message: 'Captcha verification failed. Please try again.',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        errors: verification['error-codes']
      });
    }

    // Check score threshold (reCAPTCHA v3 returns a score from 0.0 to 1.0)
    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
    if (verification.score !== undefined && verification.score < minScore) {
      console.warn(`❌ reCAPTCHA score too low: ${verification.score} (min: ${minScore})`);
      return res.status(403).json({
        message: 'Suspicious activity detected. Please try again later or contact support.',
        code: 'CAPTCHA_SCORE_TOO_LOW',
        score: verification.score
      });
    }

    console.log(`✅ reCAPTCHA verified successfully - Score: ${verification.score}`);
    
    // Captcha verified successfully, continue
    next();
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    
    // In case of verification service error, allow the request to proceed
    // but log it for monitoring
    console.warn('⚠️ reCAPTCHA service error - allowing request to proceed');
    next();
  }
};

/**
 * Strict captcha verification - always requires valid captcha
 * Use for high-risk operations
 */
export const requireCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const captchaToken = req.body.captcha_token;

  if (!captchaToken) {
    return res.status(400).json({
      message: 'Captcha verification required',
      code: 'CAPTCHA_REQUIRED'
    });
  }

  try {
    const userIp = req.ip || req.socket.remoteAddress;
    const verification = await verifyRecaptcha(captchaToken, userIp);

    if (!verification.success) {
      return res.status(400).json({
        message: 'Captcha verification failed',
        code: 'CAPTCHA_VERIFICATION_FAILED'
      });
    }

    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
    if (verification.score !== undefined && verification.score < minScore) {
      return res.status(403).json({
        message: 'Captcha score too low',
        code: 'CAPTCHA_SCORE_TOO_LOW'
      });
    }

    next();
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return res.status(500).json({
      message: 'Failed to verify captcha',
      code: 'CAPTCHA_VERIFICATION_ERROR'
    });
  }
};
