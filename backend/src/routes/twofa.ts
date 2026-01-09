import { Router, Response } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = Router();

/**
 * Setup 2FA for the authenticated user
 * Generates a secret and returns a QR code
 */
router.post("/setup", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get user email from database
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId]
    );

    const userEmail = userResult.rows[0]?.email || 'user';

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `HopHop (${userEmail})`,
      issuer: "HopHop",
    });

    // Store the secret temporarily (not enabled yet)
    await pool.query(
      `UPDATE users SET twofa_secret = $1 WHERE id = $2`,
      [secret.base32, userId]
    );

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    logger.auth("2FA setup initiated", userId, true);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      message: "Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)",
    });
  } catch (error) {
    logger.error("Error setting up 2FA", error);
    res.status(500).json({ message: "Error setting up 2FA" });
  }
});

/**
 * Verify 2FA token and enable 2FA for the user
 */
router.post("/verify", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    // Get the user's secret
    const userResult = await pool.query(
      `SELECT twofa_secret FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = userResult.rows[0].twofa_secret;

    if (!secret) {
      return res.status(400).json({ message: "2FA not set up. Please call /setup first" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps before/after for clock drift
    });

    if (!verified) {
      logger.security("2FA verification failed", { userId, token: "***" });
      return res.status(400).json({ message: "Invalid token" });
    }

    // Enable 2FA for the user
    await pool.query(
      `UPDATE users SET twofa_enabled = TRUE WHERE id = $1`,
      [userId]
    );

    logger.auth("2FA enabled successfully", userId, true);

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    logger.error("Error verifying 2FA token", error);
    res.status(500).json({ message: "Error verifying 2FA" });
  }
});

/**
 * Disable 2FA for the authenticated user
 */
router.post("/disable", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required to disable 2FA" });
    }

    // Get the user's secret
    const userResult = await pool.query(
      `SELECT twofa_secret, twofa_enabled FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { twofa_secret: secret, twofa_enabled } = userResult.rows[0];

    if (!twofa_enabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!verified) {
      logger.security("Failed attempt to disable 2FA with invalid token", { userId });
      return res.status(400).json({ message: "Invalid token" });
    }

    // Disable 2FA
    await pool.query(
      `UPDATE users SET twofa_enabled = FALSE, twofa_secret = NULL WHERE id = $1`,
      [userId]
    );

    logger.auth("2FA disabled", userId, true);

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    logger.error("Error disabling 2FA", error);
    res.status(500).json({ message: "Error disabling 2FA" });
  }
});

/**
 * Check if 2FA is enabled for the authenticated user
 */
router.get("/status", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const result = await pool.query(
      `SELECT twofa_enabled FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      twofa_enabled: result.rows[0].twofa_enabled || false 
    });
  } catch (error) {
    logger.error("Error checking 2FA status", error);
    res.status(500).json({ message: "Error checking 2FA status" });
  }
});

export default router;
