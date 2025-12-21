import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
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

export default router;
