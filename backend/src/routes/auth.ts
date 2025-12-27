import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
const router = Router();

/**
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
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
    // check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `
      INSERT INTO users
        (email, password_hash, first_name, last_name, phone, gender, address, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING id
      `,
      [
        email,
        password_hash,
        first_name || null,
        last_name || null,
        phone || null,
        gender || null,
        address || null,
      ]
    );

    const userId = result.rows[0].id;

    // generate JWT
    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Register failed",
       error: String(error),
    });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);

  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
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
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('name', r.name)
          ) FILTER (WHERE r.name IS NOT NULL),
          '[]'
        ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    
    // Determine primary role (admin > driver > user)
    let role = "user";
    const roleNames = user.roles.map((r: any) => r.name?.toLowerCase()).filter(Boolean);
    
    if (roleNames.includes("admin") || roleNames.includes("administrator")) {
      role = "admin";
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
