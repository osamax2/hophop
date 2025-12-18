import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/trips
router.get("/", async (_req, res) => {
  const r = await pool.query(
    `
    SELECT
      t.*,
      c1.name as from_city,
      c2.name as to_city
    FROM trips t
    JOIN routes r ON r.id = t.route_id
    JOIN cities c1 ON c1.id = r.from_city_id
    JOIN cities c2 ON c2.id = r.to_city_id
    ORDER BY t.id DESC
    LIMIT 200
    `
  );
  res.json(r.rows);
});

// POST /api/admin/trips
router.post("/", async (req, res) => {
  const {
    route_id,
    company_id,
    transport_type_id,
    departure_station_id,
    arrival_station_id,
    departure_time, // timestamp string
    arrival_time,   // timestamp string
    duration_minutes,
    seats_total,
    status = "scheduled",
    is_active = true,
    equipment = null,
    cancellation_policy = null,
    extra_info = null,
  } = req.body;

  if (
    !route_id || !company_id || !transport_type_id ||
    !departure_station_id || !arrival_station_id ||
    !departure_time || !arrival_time ||
    !duration_minutes || !seats_total
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const r = await pool.query(
    `
    INSERT INTO trips (
      route_id, company_id, transport_type_id,
      departure_station_id, arrival_station_id,
      departure_time, arrival_time, duration_minutes,
      seats_total, seats_available,
      status, is_active,
      equipment, cancellation_policy, extra_info
    )
    VALUES (
      $1,$2,$3,
      $4,$5,
      $6::timestamp,$7::timestamp,$8,
      $9,$9,
      $10,$11,
      $12,$13,$14
    )
    RETURNING *
    `,
    [
      route_id, company_id, transport_type_id,
      departure_station_id, arrival_station_id,
      departure_time, arrival_time, duration_minutes,
      seats_total,
      status, is_active,
      equipment, cancellation_policy, extra_info
    ]
  );

  res.status(201).json(r.rows[0]);
});

// PATCH /api/admin/trips/:id
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);

  // تحديثات بسيطة شائعة
  const allowed = [
    "departure_time",
    "arrival_time",
    "duration_minutes",
    "seats_total",
    "seats_available",
    "status",
    "is_active",
    "equipment",
    "cancellation_policy",
    "extra_info",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${idx++}${key.includes("time") ? "::timestamp" : ""}`);
      values.push(req.body[key]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  values.push(id);
  const q = `UPDATE trips SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`;
  const r = await pool.query(q, values);

  res.json(r.rows[0]);
});

// DELETE /api/admin/trips/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await pool.query(`DELETE FROM trips WHERE id=$1`, [id]);
  res.json({ ok: true });
});

export default router;
