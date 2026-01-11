import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/fare-categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, code, label, description, is_extra 
       FROM fare_categories 
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching fare categories:", error);
    res.status(500).json({ message: "Failed to fetch fare categories", error: error.message });
  }
});

// POST /api/admin/fare-categories
router.post("/", async (req, res) => {
  try {
    const { code, label, description, is_extra } = req.body;

    if (!code || !label) {
      return res.status(400).json({ message: "Code and label are required" });
    }

    const result = await pool.query(
      `INSERT INTO fare_categories (code, label, description, is_extra)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [code, label, description || null, is_extra || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating fare category:", error);
    res.status(500).json({ message: "Failed to create fare category", error: error.message });
  }
});

export default router;
