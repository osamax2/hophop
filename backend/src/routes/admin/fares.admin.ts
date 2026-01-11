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

// POST /api/admin/fares/bulk - Create multiple fares for a trip
router.post("/bulk", async (req, res) => {
  const { trip_id, fares } = req.body;

  if (!trip_id || !fares || !Array.isArray(fares)) {
    return res.status(400).json({ message: "Missing trip_id or fares array" });
  }

  if (fares.length === 0) {
    return res.json({ message: "No fares to create", created: [] });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, get the trip currency and base price
      const tripQuery = await client.query(
        `SELECT price, currency FROM trips WHERE id = $1`,
        [trip_id]
      );
      
      if (tripQuery.rows.length === 0) {
        throw new Error('Trip not found');
      }

      const basePrice = tripQuery.rows[0].price || 0;
      const currency = tripQuery.rows[0].currency || 'SYP';

      // Optional: Delete existing fares for this trip (if updating)
      // await client.query('DELETE FROM trip_fares WHERE trip_id = $1', [trip_id]);

      const createdFares = [];
      
      for (const fare of fares) {
        const { fare_category_id, booking_option_id, price_modifier, seats_available } = fare;
        
        if (!fare_category_id || !booking_option_id) {
          continue; // Skip invalid entries
        }

        const finalPrice = parseFloat(basePrice) + parseFloat(price_modifier || 0);
        const seats = seats_available || 0;

        const result = await client.query(
          `INSERT INTO trip_fares (trip_id, fare_category_id, booking_option_id, price, currency, seats_available)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [trip_id, fare_category_id, booking_option_id, finalPrice, currency, seats]
        );

        createdFares.push(result.rows[0]);
      }

      await client.query('COMMIT');
      res.status(201).json({ message: "Fares created successfully", created: createdFares });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error creating bulk fares:', err);
    res.status(500).json({ message: err.message || "Error creating fares" });
  }
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
