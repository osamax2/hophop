import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../../db";
import jwt from "jsonwebtoken";

const router = Router();

// Helper function to get user info from token
async function getUserFromToken(req: any): Promise<{id: number, company_id: number | null, agent_type: string | null, isAdmin: boolean} | null> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return null;

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as { id: number };
    
    // Get user with company_id and agent_type
    const result = await pool.query(`
      SELECT u.id, u.company_id, ut.code as agent_type,
             EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name = 'Administrator') as is_admin
      FROM users u
      LEFT JOIN user_types ut ON u.user_type_id = ut.id
      WHERE u.id = $1
    `, [payload.id]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      company_id: user.company_id,
      agent_type: user.agent_type,
      isAdmin: user.is_admin
    };
  } catch (err) {
    return null;
  }
}

// GET /api/admin/users
router.get("/", async (req, res) => {
  const showDeleted = req.query.showDeleted === 'true';
  
  // Get user from token to determine filtering
  const currentUser = await getUserFromToken(req);
  const isAgentManager = currentUser && !currentUser.isAdmin && currentUser.agent_type === 'manager' && currentUser.company_id;
  
  // Add company filter for agent managers
  const companyFilter = isAgentManager ? `AND u.company_id = ${currentUser.company_id}` : '';
  
  // Agent managers see ALL users of their company (active and inactive)
  // Admins use the showDeleted toggle
  const activeFilter = isAgentManager ? '' : (showDeleted ? 'AND u.is_active = false' : 'AND u.is_active = true');
  
  console.log(`Fetching users, showDeleted: ${showDeleted}, isAgentManager: ${isAgentManager}, companyId: ${currentUser?.company_id}`);
  
  const query = `
    SELECT
      u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
      u.status,
      u.company_id, u.user_type_id,
      tc.name AS company_name,
      ut.code AS agent_type, ut.name AS agent_type_name,
      COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN transport_companies tc ON tc.id = u.company_id
    LEFT JOIN user_types ut ON ut.id = u.user_type_id
    WHERE 1=1 ${activeFilter} ${companyFilter}
    GROUP BY u.id, tc.name, ut.code, ut.name
    ORDER BY u.id DESC
    LIMIT 200
  `;
  const r = await pool.query(query);
  res.json(r.rows);
});

// GET /api/admin/users/agent-types
router.get("/agent-types", async (_req, res) => {
  const r = await pool.query(`SELECT id, code, name, name_ar, description FROM user_types ORDER BY id`);
  res.json(r.rows);
});

// PATCH /api/admin/users/:id/active
router.patch("/:id/active", async (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;
  if (typeof is_active !== "boolean") return res.status(400).json({ message: "is_active must be boolean" });

  // Update both is_active and status
  const status = is_active ? 'active' : 'inactive';
  const r = await pool.query(
    `UPDATE users SET is_active=$1, status=$2 WHERE id=$3 RETURNING id,email,is_active,status`, 
    [is_active, status, id]
  );
  res.json(r.rows[0]);
});

// PATCH /api/admin/users/:id/status - Update user status (active, inactive, blocked)
router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  
  const validStatuses = ['active', 'inactive', 'blocked'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "status must be 'active', 'inactive', or 'blocked'" });
  }

  try {
    // Get current user from token to check permissions
    const currentUser = await getUserFromToken(req);
    
    // If agent manager, verify the target user belongs to same company
    if (currentUser && !currentUser.isAdmin && currentUser.agent_type === 'manager' && currentUser.company_id) {
      const targetUser = await pool.query(
        "SELECT company_id FROM users WHERE id = $1",
        [id]
      );
      
      if (targetUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (targetUser.rows[0].company_id !== currentUser.company_id) {
        return res.status(403).json({ message: "You can only change status for users in your company" });
      }
    }

    // Update status and is_active (for backwards compatibility)
    const is_active = status === 'active';
    const r = await pool.query(
      `UPDATE users SET status=$1, is_active=$2 WHERE id=$3 RETURNING id,email,status,is_active`, 
      [status, is_active, id]
    );
    
    if (r.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(r.rows[0]);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// PATCH /api/admin/users/:id/agent-info - Update company and agent type
router.patch("/:id/agent-info", async (req, res) => {
  const userId = Number(req.params.id);
  const { company_id, agent_type } = req.body;

  try {
    // Get user_type_id from agent_type code
    let userTypeId = null;
    if (agent_type) {
      const typeResult = await pool.query(`SELECT id FROM user_types WHERE code = $1`, [agent_type]);
      if (typeResult.rows.length > 0) {
        userTypeId = typeResult.rows[0].id;
      }
    }

    const r = await pool.query(
      `UPDATE users SET company_id = $1, user_type_id = $2, updated_at = NOW() WHERE id = $3 
       RETURNING id, company_id, user_type_id`,
      [company_id || null, userTypeId, userId]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ ok: true, user: r.rows[0] });
  } catch (e) {
    console.error("update agent info error:", e);
    res.status(500).json({ message: "Failed to update agent info" });
  }
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
