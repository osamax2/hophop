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

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE email = $1 AND is_active = true
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
       error: String(error),
    });
  }
});

export default router;
