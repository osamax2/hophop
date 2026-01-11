import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/booking-options
router.get("/", async (req, res) => {
  try {
    const { transport_type_id } = req.query;
    
    let query = `
      SELECT id, transport_type_id, code, label, description 
      FROM booking_options
    `;
    const values: any[] = [];

    if (transport_type_id) {
      query += ` WHERE transport_type_id = $1`;
      values.push(Number(transport_type_id));
    }

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching booking options:", error);
    res.status(500).json({ message: "Failed to fetch booking options", error: error.message });
  }
});

// POST /api/admin/booking-options
router.post("/", async (req, res) => {
  try {
    const { transport_type_id, code, label, description } = req.body;

    if (!code || !label) {
      return res.status(400).json({ message: "Code and label are required" });
    }

    const result = await pool.query(
      `INSERT INTO booking_options (transport_type_id, code, label, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [transport_type_id || null, code, label, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating booking option:", error);
    res.status(500).json({ message: "Failed to create booking option", error: error.message });
  }
});

export default router;
