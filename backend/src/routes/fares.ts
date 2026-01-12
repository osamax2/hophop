import { Router } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/fares?trip_id=1 - Public endpoint for trip fares
router.get("/", async (req, res) => {
  const tripId = req.query.trip_id ? Number(req.query.trip_id) : null;

  if (!tripId) {
    return res.status(400).json({ message: "trip_id is required" });
  }

  try {
    const r = await pool.query(
      `
      SELECT
        tf.id,
        tf.trip_id,
        tf.price,
        tf.currency,
        tf.seats_available,
        fc.code as fare_category_code,
        fc.label as fare_category_label,
        bo.code as booking_option_code,
        bo.label as booking_option_label
      FROM trip_fares tf
      JOIN fare_categories fc ON fc.id=tf.fare_category_id
      JOIN booking_options bo ON bo.id=tf.booking_option_id
      WHERE tf.trip_id = $1
      ORDER BY tf.price ASC
      `,
      [tripId]
    );

    res.json(r.rows);
  } catch (error) {
    console.error("Error fetching fares:", error);
    res.status(500).json({ message: "Error fetching fares" });
  }
});

export default router;
