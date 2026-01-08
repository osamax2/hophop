import { Router } from "express";
import { authenticateToken, requireCompanyAdmin } from "../middleware/auth";
import { pool } from "../db";

const router = Router();

// Get all branches for a company
router.get("/company/:companyId", authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, c.name as city_name,
        (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND is_active = true) as staff_count
       FROM branches b
       LEFT JOIN cities c ON b.city_id = c.id
       WHERE b.company_id = $1
       ORDER BY b.created_at DESC`,
      [companyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
});

// Get single branch
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, c.name as city_name
       FROM branches b
       LEFT JOIN cities c ON b.city_id = c.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ message: "Failed to fetch branch" });
  }
});

// Create new branch
router.post("/", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { company_id, name, address, city_id, phone, email } = req.body;
    
    if (!company_id || !name) {
      return res.status(400).json({ message: "Company ID and name are required" });
    }
    
    // Check subscription limit (trigger will handle this)
    const result = await pool.query(
      `INSERT INTO branches (company_id, name, address, city_id, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [company_id, name, address, city_id, phone, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating branch:", error);
    if (error.message?.includes("Branch limit exceeded")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create branch" });
  }
});

// Update branch
router.put("/:id", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city_id, phone, email, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE branches 
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           city_id = COALESCE($3, city_id),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, address, city_id, phone, email, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ message: "Failed to update branch" });
  }
});

// Delete branch
router.delete("/:id", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if branch has staff
    const staffCheck = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE branch_id = $1 AND is_active = true",
      [id]
    );
    
    if (parseInt(staffCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: "Cannot delete branch with active staff members. Please reassign or deactivate staff first." 
      });
    }
    
    const result = await pool.query(
      "DELETE FROM branches WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ message: "Failed to delete branch" });
  }
});

// Get staff for a branch
router.get("/:id/staff", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT u.*, bsr.code as role_code, bsr.name as role_name
       FROM users u
       LEFT JOIN branch_staff_roles bsr ON u.branch_staff_role_id = bsr.id
       WHERE u.branch_id = $1 AND u.is_active = true
       ORDER BY bsr.id, u.first_name`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching branch staff:", error);
    res.status(500).json({ message: "Failed to fetch branch staff" });
  }
});

export default router;
