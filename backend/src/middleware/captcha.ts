import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import type { Request, Response, NextFunction } from 'express';
import { AuthedRequest } from './auth';

// Environment variables
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID || 'hophopsy';
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '6LddUUUsAAAAAJNWhYX6kHD--_5MNwdTxeTGvrkJ';
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY || '';
const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

// Create reCAPTCHA Enterprise client (cached for reuse)
let client: RecaptchaEnterpriseServiceClient | null = null;

function getClient(): RecaptchaEnterpriseServiceClient {
  if (!client) {
    // Initialize with API key if available
    const options = RECAPTCHA_API_KEY ? { apiKey: RECAPTCHA_API_KEY } : {};
    client = new RecaptchaEnterpriseServiceClient(options);
  }
  return client;
}

interface RecaptchaAssessmentResult {
  valid: boolean;
  score: number;
  action: string;
  invalidReason?: string;
  reasons?: string[];
}

/**
 * Create an assessment to analyze the risk of a UI action using reCAPTCHA Enterprise
 * Based on official Google Cloud documentation
 * 
 * @param token - The generated token obtained from the client
 * @param expectedAction - Action name corresponding to the token (e.g., 'guest_booking')
 * @returns Promise<RecaptchaAssessmentResult>
 */
async function verifyRecaptchaEnterprise(
  token: string,
  expectedAction: string
): Promise<RecaptchaAssessmentResult> {
  try {
    const client = getClient();
    const projectPath = client.projectPath(RECAPTCHA_PROJECT_ID);

    // Build the assessment request
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: RECAPTCHA_SITE_KEY,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      const invalidReason = response.tokenProperties?.invalidReason || 'UNKNOWN';
      console.log(`❌ Token validation failed: ${invalidReason}`);
      return {
        valid: false,
        score: 0,
        action: '',
        invalidReason: String(invalidReason)
      };
    }

    // Check if the expected action was executed
    const action = response.tokenProperties.action || '';
    if (action !== expectedAction) {
      console.log(`❌ Action mismatch: expected '${expectedAction}', got '${action}'`);
      return {
        valid: false,
        score: 0,
        action: action,
        invalidReason: `ACTION_MISMATCH: expected '${expectedAction}', got '${action}'`
      };
    }

    // Get the risk score and reasons
    const score = response.riskAnalysis?.score || 0;
    const reasons = (response.riskAnalysis?.reasons || []).map(r => String(r));

    console.log(`✅ reCAPTCHA score: ${score}`);
    if (reasons.length > 0) {
      reasons.forEach(reason => console.log(`   Reason: ${reason}`));
    }

    return {
      valid: true,
      score: score,
      action: action,
      reasons: reasons
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

    // Guest booking - check if captcha is configured
    const captchaToken = req.body.captcha_token;

    // If no API key is configured, skip verification with warning
    if (!RECAPTCHA_API_KEY) {
      console.warn('⚠️ reCAPTCHA Enterprise API key not configured - skipping verification (using rate limiting only)');
      return next();
    }

    if (!captchaToken) {
      console.warn('⚠️ Guest booking without captcha token');
      return res.status(400).json({ 
        message: 'Security verification required for guest bookings' 
      });
    }

    console.log('🔍 Verifying reCAPTCHA Enterprise token for guest booking...');

    // Verify the captcha token
    const verification = await verifyRecaptchaEnterprise(captchaToken, 'guest_booking');

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
    
    // Fail open (allow request) and rely on rate limiting
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

    const verification = await verifyRecaptchaEnterprise(captchaToken, req.body.action || 'submit');

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
