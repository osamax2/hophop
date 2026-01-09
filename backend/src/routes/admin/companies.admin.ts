import { Router } from "express";
import { pool } from "../../db";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { sendVerificationEmail, sendWelcomeEmail } from "../../services/email.service";
import crypto from "crypto";

const router = Router();

// Helper function to generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// GET /api/admin/companies - Get all companies (including soft deleted if query param showDeleted=true)
router.get("/", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  try {
    const showDeleted = req.query.showDeleted === 'true';
    
    let query = `
      SELECT 
        tc.*,
        COUNT(t.id) as trips_count,
        COUNT(DISTINCT u.id) as users_count
      FROM transport_companies tc
      LEFT JOIN trips t ON t.company_id = tc.id
      LEFT JOIN users u ON u.company_id = tc.id
    `;
    
    if (!showDeleted) {
      query += ` WHERE tc.deleted_at IS NULL`;
    }
    
    query += ` GROUP BY tc.id ORDER BY tc.created_at DESC`;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error loading companies:', error);
    res.status(500).json({ error: 'Failed to load companies', details: error.message });
  }
});

// GET /api/admin/companies/:id - Get company by ID
router.get("/:id", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT tc.*, 
        COUNT(DISTINCT t.id) as trips_count,
        COUNT(DISTINCT u.id) as users_count
       FROM transport_companies tc
       LEFT JOIN trips t ON t.company_id = tc.id
       LEFT JOIN users u ON u.company_id = tc.id
       WHERE tc.id = $1
       GROUP BY tc.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error loading company:', error);
    res.status(500).json({ error: 'Failed to load company', details: error.message });
  }
});

// POST /api/admin/companies - Create new company
router.post("/", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      name, 
      description, 
      address, 
      phone, 
      email,
      cr_number,
      logo_url,
      // User account details
      first_name,
      last_name,
      user_email,
      user_phone,
      password
    } = req.body;
    
    // Validation
    if (!name || !phone || !email || !cr_number) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'phone', 'email', 'cr_number'] 
      });
    }
    
    // Check if company with same CR number already exists
    const existingCompany = await client.query(
      'SELECT id FROM transport_companies WHERE cr_number = $1 AND deleted_at IS NULL',
      [cr_number]
    );
    
    if (existingCompany.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Company with this CR number already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await client.query(
      'SELECT id FROM transport_companies WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Company with this email already exists' });
    }
    
    // Insert company
    const companyResult = await client.query(
      `INSERT INTO transport_companies 
        (name, description, address, phone, email, cr_number, logo_url, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       RETURNING *`,
      [name, description, address, phone, email, cr_number, logo_url]
    );
    
    const company = companyResult.rows[0];
    
    // If user account details provided, create user account
    if (user_email && password && first_name && last_name) {
      const bcrypt = require('bcrypt');
      
      // Check if user email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user_email]
      );
      
      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Create user (inactive until email verified)
      const userResult = await client.query(
        `INSERT INTO users 
          (email, phone, password_hash, first_name, last_name, company_id, is_active, status, 
           email_verified, verification_token, verification_token_expires, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, 'inactive', false, $7, $8, NOW())
         RETURNING id`,
        [user_email, user_phone, passwordHash, first_name, last_name, company.id, verificationToken, tokenExpires]
      );
      
      const userId = userResult.rows[0].id;
      
      // Send verification email
      await sendVerificationEmail({
        to: user_email,
        firstName: first_name,
        verificationToken,
      });
      
      // Assign 'Agent' role
      const agentRole = await client.query(
        "SELECT id FROM roles WHERE name = 'Agent'"
      );
      
      if (agentRole.rows.length > 0) {
        await client.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [userId, agentRole.rows[0].id]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(company);
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/admin/companies/:id - Update company
router.put("/:id", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      address, 
      phone, 
      email,
      cr_number,
      logo_url,
      is_active
    } = req.body;
    
    // Validation
    if (!name || !phone || !email || !cr_number) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'phone', 'email', 'cr_number'] 
      });
    }
    
    // Check if company exists
    const existing = await pool.query(
      'SELECT id FROM transport_companies WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Check if CR number is taken by another company
    const duplicateCR = await pool.query(
      'SELECT id FROM transport_companies WHERE cr_number = $1 AND id != $2 AND deleted_at IS NULL',
      [cr_number, id]
    );
    
    if (duplicateCR.rows.length > 0) {
      return res.status(400).json({ error: 'Another company with this CR number already exists' });
    }
    
    // Check if email is taken by another company
    const duplicateEmail = await pool.query(
      'SELECT id FROM transport_companies WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
      [email, id]
    );
    
    if (duplicateEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Another company with this email already exists' });
    }
    
    // Update company
    const result = await pool.query(
      `UPDATE transport_companies 
       SET name = $1, description = $2, address = $3, phone = $4, email = $5, 
           cr_number = $6, logo_url = $7, is_active = $8
       WHERE id = $9
       RETURNING *`,
      [name, description, address, phone, email, cr_number, logo_url, is_active, id]
    );
    
    res.json(result.rows[0]);
    
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company', details: error.message });
  }
});

// DELETE /api/admin/companies/:id - Soft delete company
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      // Permanent delete
      await pool.query('DELETE FROM transport_companies WHERE id = $1', [id]);
      res.json({ message: 'Company permanently deleted' });
    } else {
      // Soft delete
      const result = await pool.query(
        `UPDATE transport_companies 
         SET deleted_at = NOW(), is_active = false
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found or already deleted' });
      }
      
      // Also deactivate associated users
      await pool.query(
        'UPDATE users SET is_active = false WHERE company_id = $1',
        [id]
      );
      
      res.json({ message: 'Company soft deleted', company: result.rows[0] });
    }
    
  } catch (error: any) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company', details: error.message });
  }
});

// POST /api/admin/companies/:id/restore - Restore soft deleted company
router.post("/:id/restore", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE transport_companies 
       SET deleted_at = NULL, is_active = true
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Reactivate associated users
    await pool.query(
      'UPDATE users SET is_active = true WHERE company_id = $1',
      [id]
    );
    
    res.json({ message: 'Company restored', company: result.rows[0] });
    
  } catch (error: any) {
    console.error('Error restoring company:', error);
    res.status(500).json({ error: 'Failed to restore company', details: error.message });
  }
});

export default router;
