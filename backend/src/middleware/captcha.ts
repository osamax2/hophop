import type { Request, Response, NextFunction } from 'express';
import { AuthedRequest } from './auth';
import https from 'https';

// Environment variables
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID || 'hophopsy';
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '6LddUUUsAAAAAJNWhYX6kHD--_5MNwdTxeTGvrkJ';
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY || ''; // Optional: Google Cloud API Key
const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

interface RecaptchaAssessmentResult {
  valid: boolean;
  score: number;
  action: string;
  invalidReason?: string;
  reasons?: string[];
}

/**
 * Verify reCAPTCHA Enterprise token using REST API
 * @param token - The reCAPTCHA Enterprise token from the client
 * @param expectedAction - Expected action name (e.g., 'guest_booking')
 * @param userIp - Optional client IP address for additional context
 * @returns Promise<RecaptchaAssessmentResult>
 */
async function verifyRecaptchaEnterprise(
  token: string, 
  expectedAction: string,
  userIp?: string
): Promise<RecaptchaAssessmentResult> {
  try {
    // Build assessment request body
    const requestBody = JSON.stringify({
      event: {
        token: token,
        siteKey: RECAPTCHA_SITE_KEY,
        ...(userIp && { userIpAddress: userIp })
      }
    });

    // Use REST API endpoint
    const apiUrl = RECAPTCHA_API_KEY 
      ? `/v1/projects/${RECAPTCHA_PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`
      : `/v1/projects/${RECAPTCHA_PROJECT_ID}/assessments`;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'recaptchaenterprise.googleapis.com',
        port: 443,
        path: apiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            // Handle API errors
            if (response.error) {
              console.error('❌ reCAPTCHA Enterprise API error:', response.error);
              resolve({
                valid: false,
                score: 0,
                action: '',
                invalidReason: response.error.message || 'API_ERROR'
              });
              return;
            }

            // Check if the token is valid
            if (!response.tokenProperties?.valid) {
              resolve({
                valid: false,
                score: 0,
                action: '',
                invalidReason: String(response.tokenProperties?.invalidReason || 'UNKNOWN')
              });
              return;
            }

            // Check if the expected action was executed
            const action = response.tokenProperties.action || '';
            if (action !== expectedAction) {
              resolve({
                valid: false,
                score: 0,
                action: action,
                invalidReason: `ACTION_MISMATCH: expected '${expectedAction}', got '${action}'`
              });
              return;
            }

            // Get the risk score and reasons
            const score = response.riskAnalysis?.score || 0;
            const reasons = (response.riskAnalysis?.reasons || []).map((r: any) => String(r));

            resolve({
              valid: true,
              score: score,
              action: action,
              reasons: reasons
            });
          } catch (error) {
            reject(new Error('Failed to parse reCAPTCHA response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    console.error('❌ reCAPTCHA Enterprise verification error:', error);
    throw error;
  }
}

/**
 * Express middleware: Verify reCAPTCHA Enterprise for guest bookings only
 * Authenticated users bypass this check
 * 
 * Expected request body: { captcha_token?: string, ... }
 * 
 * Blocks requests with:
 * - Missing captcha_token (for guests)
 * - Invalid tokens
 * - Low risk scores (< RECAPTCHA_MIN_SCORE)
 */
export const verifyCaptchaEnterpriseForGuests = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    // Skip captcha verification for authenticated users
    if (req.user) {
      console.log('✅ Authenticated user - skipping reCAPTCHA Enterprise check');
      return next();
    }

    // Guest booking - check if captcha is configured
    const captchaToken = req.body.captcha_token;

    // If no API key is configured, skip verification with warning
    if (!RECAPTCHA_API_KEY) {
      console.warn('⚠️ reCAPTCHA Enterprise API key not configured - skipping verification (using rate limiting only)');
      return next();
    }

    if (!captchaToken) {
      console.warn('⚠️ Guest booking without captcha token');
      // Allow the request but log it
      console.warn('⚠️ Allowing guest booking without captcha (API key configured but no token provided)');
      return next();
    }

    // Get user IP
    const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   undefined;

    console.log('🔍 Verifying reCAPTCHA Enterprise token for guest booking...');

    // Verify the captcha token
    const verification = await verifyRecaptchaEnterprise(captchaToken, 'guest_booking', userIp);

    if (!verification.valid) {
      console.warn('❌ reCAPTCHA Enterprise verification failed:', verification.invalidReason);
      // Log but allow - rely on rate limiting
      console.warn('⚠️ Allowing request despite failed captcha verification (rate limiting active)');
      return next();
    }

    if (verification.score < RECAPTCHA_MIN_SCORE) {
      console.warn(`⚠️ Low reCAPTCHA Enterprise score: ${verification.score} (threshold: ${RECAPTCHA_MIN_SCORE})`);
      if (verification.reasons && verification.reasons.length > 0) {
        console.warn('Reasons:', verification.reasons.join(', '));
      }
      // Log but allow - rely on rate limiting
      console.warn('⚠️ Allowing request despite low score (rate limiting active)');
      return next();
    }

    console.log(`✅ reCAPTCHA Enterprise verified successfully - Score: ${verification.score}`);
    
    // Continue to the next middleware
    next();
  } catch (error) {
    console.error('❌ reCAPTCHA Enterprise middleware error:', error);
    
    // Always fail open (allow request) and rely on rate limiting
    console.warn('⚠️ Allowing request despite captcha error (rate limiting active)');
    next();
  }
};

/**
 * Express middleware: Strict reCAPTCHA Enterprise verification for all requests
 * Does NOT skip authenticated users
 * 
 * Use this for high-risk operations that need captcha regardless of auth status
 */
export const requireCaptchaEnterprise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const captchaToken = req.body.captcha_token;

    if (!captchaToken) {
      return res.status(400).json({ 
        message: 'Security verification required' 
      });
    }

    const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.socket.remoteAddress || 
                   undefined;

    const verification = await verifyRecaptchaEnterprise(captchaToken, req.body.action || 'submit', userIp);

    if (!verification.valid || verification.score < RECAPTCHA_MIN_SCORE) {
      return res.status(403).json({ 
        message: 'Security verification failed',
        details: verification.invalidReason 
      });
    }

    next();
  } catch (error) {
    console.error('❌ reCAPTCHA Enterprise strict verification error:', error);
    return res.status(500).json({ 
      message: 'Security verification service unavailable' 
    });
  }
};
