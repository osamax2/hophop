import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/users
router.get("/", async (req, res) => {
  const showDeleted = req.query.showDeleted === 'true';
  const query = showDeleted
    ? `
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.is_active = false
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT 200
    `
    : `
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.is_active = true
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT 200
    `;
  const r = await pool.query(query);
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

// PATCH /api/admin/users/:id/profile  body: { first_name?, last_name?, email?, password?, role_names? }
router.patch("/:id/profile", async (req, res) => {
  const userId = Number(req.params.id);
  const { first_name, last_name, email, password, role_names } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if email already exists (if email is being changed)
    if (email) {
      const emailCheck = await client.query(
        `SELECT id FROM users WHERE email = $1 AND id != $2`,
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Build update query for user table
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(first_name || null);
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(last_name || null);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (password !== undefined && password !== null && password !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(password_hash);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(userId);
      await client.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
    }

    // Update roles if provided
    if (Array.isArray(role_names)) {
      await client.query(`DELETE FROM user_roles WHERE user_id=$1`, [userId]);
      for (const roleName of role_names) {
        const role = await client.query(`SELECT id FROM roles WHERE name=$1 LIMIT 1`, [roleName]);
        if (role.rows.length === 0) continue;
        await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)`, [userId, role.rows[0].id]);
      }
    }

    await client.query("COMMIT");
    res.json({ ok: true, message: "User profile updated successfully" });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("update user profile error:", e);
    res.status(500).json({ message: "Failed to update user profile", error: String(e) });
  } finally {
    client.release();
  }
});

export default router;
