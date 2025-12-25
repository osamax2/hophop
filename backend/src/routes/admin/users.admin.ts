import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/users
router.get("/", async (_req, res) => {
  const r = await pool.query(
    `
    SELECT
      u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
      COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    GROUP BY u.id
    ORDER BY u.id DESC
    LIMIT 200
    `
  );
  res.json(r.rows);
});

// PATCH /api/admin/users/:id/active
router.patch("/:id/active", async (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;
  if (typeof is_active !== "boolean") return res.status(400).json({ message: "is_active must be boolean" });

  const r = await pool.query(`UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id,email,is_active`, [is_active, id]);
  res.json(r.rows[0]);
});

// PUT /api/admin/users/:id/roles  body: { role_names: ["Administrator","Agent"] }
router.put("/:id/roles", async (req, res) => {
  const userId = Number(req.params.id);
  const { role_names } = req.body as { role_names?: string[] };

  if (!Array.isArray(role_names)) return res.status(400).json({ message: "role_names must be array" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`DELETE FROM user_roles WHERE user_id=$1`, [userId]);

    for (const roleName of role_names) {
      const role = await client.query(`SELECT id FROM roles WHERE name=$1 LIMIT 1`, [roleName]);
      if (role.rows.length === 0) continue;

      await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)`, [userId, role.rows[0].id]);
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("set roles error:", e);
    res.status(500).json({ message: "Failed to set roles" });
  } finally {
    client.release();
  }
});

export default router;
