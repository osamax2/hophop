import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/email.service";
import { registerLimiter, loginLimiter, emailVerificationLimiter } from "../middleware/rateLimiter";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "../utils/sanitize";

const router = Router();

// Helper function to generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * POST /api/auth/register
 * Creates a new user account with email verification
 * Protected by rate limiting to prevent mass account creation
 */
router.post("/register", registerLimiter, async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    gender,
    address,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Sanitize and validate input
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const sanitizedFirstName = first_name ? sanitizeString(first_name) : null;
    const sanitizedLastName = last_name ? sanitizeString(last_name) : null;
    const sanitizedPhone = phone ? sanitizePhone(phone) : null;
    const sanitizedGender = gender ? sanitizeString(gender) : null;
    const sanitizedAddress = address ? sanitizeString(address) : null;

    // check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [sanitizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // hash password (don't sanitize password - hash it as-is)
    const password_hash = await bcrypt.hash(password, 10);
    
    // generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // insert user as inactive, pending email verification
    const result = await pool.query(
      `
      INSERT INTO users
        (email, password_hash, first_name, last_name, phone, gender, address, 
         is_active, status, email_verified, verification_token, verification_token_expires)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, false, 'inactive', false, $8, $9)
      RETURNING id
      `,
      [
        sanitizedEmail,
        password_hash,
        sanitizedFirstName,
        sanitizedLastName,
        sanitizedPhone,
        sanitizedGender,
        sanitizedAddress,
        verificationToken,
        tokenExpires,
      ]
    );

    const userId = result.rows[0].id;

    // Send verification email
    const emailSent = await sendVerificationEmail({
      to: email,
      firstName: first_name,
      verificationToken,
    });

    if (!emailSent) {
      console.error("Failed to send verification email to:", email);
    }

    res.status(201).json({ 
      message: "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Register failed",
       error: String(error),
    });
  }
});

/**
 * GET /api/auth/verify-email
 * Verify user email with token
 */
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      message: "Verification token is required",
    });
  }

  try {
    // Find user with this verification token
    const result = await pool.query(
      `
      SELECT id, email, first_name, verification_token_expires
      FROM users
      WHERE verification_token = $1
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
        code: "INVALID_TOKEN",
      });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({
        message: "Verification token has expired. Please register again.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Activate the user
    await pool.query(
      `
      UPDATE users
      SET is_active = true,
          status = 'active',
          email_verified = true,
          verification_token = NULL,
          verification_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user.id]
    );

    // Send welcome email
    await sendWelcomeEmail(user.email, user.first_name);

    // Generate JWT token so user can login immediately
    const jwtToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully! Your account is now active.",
      token: jwtToken,
      verified: true,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      message: "Verification failed",
      error: String(error),
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 * Protected by rate limiting to prevent email spam
 */
router.post("/resend-verification", emailVerificationLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    // Find user
    const result = await pool.query(
      `
      SELECT id, email, first_name, email_verified, is_active
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({
        message: "If this email exists, a verification link has been sent.",
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET verification_token = $1,
          verification_token_expires = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [verificationToken, tokenExpires, user.id]
    );

    // Send verification email
    await sendVerificationEmail({
      to: user.email,
      firstName: user.first_name,
      verificationToken,
    });

    res.json({
      message: "If this email exists, a verification link has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Failed to resend verification email",
      error: String(error),
    });
  }
});

/**
 * POST /api/auth/login
 * Protected by rate limiting to prevent brute force attacks
 */
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);

  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // First check if user exists (with or without is_active check)
    const userCheck = await pool.query(
      `
      SELECT id, email, password_hash, is_active
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    console.log("User check result:", userCheck.rows.length > 0 ? "User found" : "User not found");
    
    if (userCheck.rows.length === 0) {
      console.log("User not found in database");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = userCheck.rows[0];
    console.log("User found - is_active:", user.is_active);

    if (!user.is_active) {
      console.log("User account is inactive");
      return res.status(401).json({
        message: "Account is inactive. Please contact administrator.",
      });
    }

    console.log("Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    console.log("Login successful for user ID:", user.id);
    res.json({ token });
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Login failed",
      error: String(error),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user's information
 */
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.phone, 
        u.gender, 
        u.address,
        u.is_active,
        u.created_at,
        u.company_id,
        c.name as company_name,
        ut.code as agent_type,
        ut.name as agent_type_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('name', r.name)
          ) FILTER (WHERE r.name IS NOT NULL),
          '[]'
        ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN transport_companies c ON u.company_id = c.id
      LEFT JOIN user_types ut ON u.user_type_id = ut.id
      WHERE u.id = $1
      GROUP BY u.id, c.name, ut.code, ut.name
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    
    // Determine primary role (admin > agent > driver > user)
    let role = "user";
    const roleNames = user.roles.map((r: any) => r.name?.toLowerCase()).filter(Boolean);
    
    if (roleNames.includes("admin") || roleNames.includes("administrator")) {
      role = "admin";
    } else if (roleNames.includes("agent")) {
      role = "agent";
    } else if (roleNames.includes("driver")) {
      role = "driver";
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email.split("@")[0],
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        role: role,
        roles: roleNames,
        is_active: user.is_active,
        created_at: user.created_at,
        company_id: user.company_id,
        company_name: user.company_name,
        agent_type: user.agent_type,
        agent_type_name: user.agent_type_name,
      },
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(500).json({
      message: "Failed to get user information",
      error: String(error),
    });
  }
});

/**
 * PATCH /api/auth/me
 * Update current authenticated user's information
 */
router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone, gender, address } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramIndex++}`);
      values.push(gender);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await pool.query(
      `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, phone, gender, address, is_active, created_at, updated_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error("Update me error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: String(error),
    });
  }
});

export default router;
