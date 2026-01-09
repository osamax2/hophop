import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import type { Request, Response, NextFunction } from 'express';
import { AuthedRequest } from './auth';

// Environment variables
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID || 'hophopsy';
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '6LddUUUsAAAAAJNWhYX6kHD--_5MNwdTxeTGvrkJ';
const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

// Create reCAPTCHA Enterprise client (reusable)
const client = new RecaptchaEnterpriseServiceClient();

interface RecaptchaAssessmentResult {
  valid: boolean;
  score: number;
  action: string;
  invalidReason?: string;
  reasons?: string[];
}

/**
 * Verify reCAPTCHA Enterprise token with Google's API
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
    const projectPath = client.projectPath(RECAPTCHA_PROJECT_ID);

    // Build the assessment request
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: RECAPTCHA_SITE_KEY,
          ...(userIp && { userIpAddress: userIp })
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      return {
        valid: false,
        score: 0,
        action: '',
        invalidReason: response.tokenProperties?.invalidReason || 'UNKNOWN'
      };
    }

    // Check if the expected action was executed
    const action = response.tokenProperties.action || '';
    if (action !== expectedAction) {
      return {
        valid: false,
        score: 0,
        action: action,
        invalidReason: `ACTION_MISMATCH: expected '${expectedAction}', got '${action}'`
      };
    }

    // Get the risk score and reasons
    const score = response.riskAnalysis?.score || 0;
    const reasons = response.riskAnalysis?.reasons || [];

    return {
      valid: true,
      score: score,
      action: action,
      reasons: reasons as string[]
    };
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

    // Guest booking - require captcha
    const captchaToken = req.body.captcha_token;

    if (!captchaToken) {
      console.warn('⚠️ Guest booking without captcha token');
      return res.status(400).json({ 
        message: 'Security verification required for guest bookings' 
      });
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
      return res.status(403).json({ 
        message: 'Security verification failed. Please try again.',
        details: verification.invalidReason 
      });
    }

    if (verification.score < RECAPTCHA_MIN_SCORE) {
      console.warn(`⚠️ Low reCAPTCHA Enterprise score: ${verification.score} (threshold: ${RECAPTCHA_MIN_SCORE})`);
      if (verification.reasons && verification.reasons.length > 0) {
        console.warn('Reasons:', verification.reasons.join(', '));
      }
      return res.status(403).json({ 
        message: 'Suspicious activity detected. Please try again later.',
        score: verification.score 
      });
    }

    console.log(`✅ reCAPTCHA Enterprise verified successfully - Score: ${verification.score}`);
    
    // Continue to the next middleware
    next();
  } catch (error) {
    console.error('❌ reCAPTCHA Enterprise middleware error:', error);
    
    // In production, fail closed (block request)
    // In development, could fail open (allow request)
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ 
        message: 'Security verification service unavailable. Please try again later.' 
      });
    } else {
      // Development: log error but allow request
      console.warn('⚠️ Allowing request in development mode despite captcha error');
      next();
    }
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
