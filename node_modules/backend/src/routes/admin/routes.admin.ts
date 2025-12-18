import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/routes
router.get("/", async (_req, res) => {
  const r = await pool.query(
    `
    SELECT r.id, r.from_city_id, c1.name as from_city, r.to_city_id, c2.name as to_city
    FROM routes r
    JOIN cities c1 ON c1.id = r.from_city_id
    JOIN cities c2 ON c2.id = r.to_city_id
    ORDER BY r.id DESC
    `
  );
  res.json(r.rows);
});

// POST /api/admin/routes
router.post("/", async (req, res) => {
  const { from_city_id, to_city_id } = req.body;
  if (!from_city_id || !to_city_id || from_city_id === to_city_id) {
    return res.status(400).json({ message: "Invalid from_city_id/to_city_id" });
  }

  const r = await pool.query(
    `
    INSERT INTO routes (from_city_id, to_city_id)
    VALUES ($1,$2)
    RETURNING *
    `,
    [from_city_id, to_city_id]
  );

  res.status(201).json(r.rows[0]);
});

// DELETE /api/admin/routes/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await pool.query(`DELETE FROM routes WHERE id=$1`, [id]);
  res.json({ ok: true });
});

export default router;
