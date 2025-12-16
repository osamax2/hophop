import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/fares?trip_id=1
router.get("/", async (req, res) => {
  const tripId = req.query.trip_id ? Number(req.query.trip_id) : null;

  const r = await pool.query(
    `
    SELECT
      tf.*,
      fc.code as fare_category_code,
      bo.code as booking_option_code
    FROM trip_fares tf
    JOIN fare_categories fc ON fc.id=tf.fare_category_id
    JOIN booking_options bo ON bo.id=tf.booking_option_id
    ${tripId ? "WHERE tf.trip_id = $1" : ""}
    ORDER BY tf.id DESC
    `,
    tripId ? [tripId] : []
  );

  res.json(r.rows);
});

// POST /api/admin/fares
router.post("/", async (req, res) => {
  const { trip_id, fare_category_id, booking_option_id, price, currency, seats_available } = req.body;

  if (!trip_id || !fare_category_id || !booking_option_id || price === undefined || !currency || seats_available === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const r = await pool.query(
    `
    INSERT INTO trip_fares (trip_id, fare_category_id, booking_option_id, price, currency, seats_available)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [trip_id, fare_category_id, booking_option_id, price, currency, seats_available]
  );

  res.status(201).json(r.rows[0]);
});

// PATCH /api/admin/fares/:id
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const allowed = ["price", "currency", "seats_available"];
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(req.body[key]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ message: "No valid fields to update" });

  values.push(id);
  const q = `UPDATE trip_fares SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`;
  const r = await pool.query(q, values);

  res.json(r.rows[0]);
});

export default router;
