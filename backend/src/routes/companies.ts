import { Router } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";

const router = Router();

// POST /api/companies/register - Public company registration
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      // Company details
      company_name, 
      company_description, 
      company_address, 
      company_phone, 
      company_email,
      cr_number,
      // User account details
      first_name,
      last_name,
      user_email,
      user_phone,
      password,
      confirm_password
    } = req.body;
    
    // Validation
    if (!company_name || !company_phone || !company_email || !cr_number) {
      return res.status(400).json({ 
        error: 'Missing required company fields', 
        required: ['company_name', 'company_phone', 'company_email', 'cr_number'] 
      });
    }
    
    if (!first_name || !last_name || !user_email || !password) {
      return res.status(400).json({ 
        error: 'Missing required user fields', 
        required: ['first_name', 'last_name', 'user_email', 'password'] 
      });
    }
    
    // Password validation
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(company_email)) {
      return res.status(400).json({ error: 'Invalid company email format' });
    }
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({ error: 'Invalid user email format' });
    }
    
    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(company_phone)) {
      return res.status(400).json({ error: 'Invalid company phone format' });
    }
    
    // CR number validation (should be unique)
    if (cr_number.length < 5) {
      return res.status(400).json({ error: 'CR number must be at least 5 characters long' });
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
    
    // Check if company email already exists
    const existingCompanyEmail = await client.query(
      'SELECT id FROM transport_companies WHERE email = $1 AND deleted_at IS NULL',
      [company_email]
    );
    
    if (existingCompanyEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Company with this email already exists' });
    }
    
    // Check if user email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [user_email]
    );
    
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert company (pending approval - is_active = false)
    const companyResult = await client.query(
      `INSERT INTO transport_companies 
        (name, description, address, phone, email, cr_number, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING *`,
      [company_name, company_description, company_address, company_phone, company_email, cr_number]
    );
    
    const company = companyResult.rows[0];
    
    // Create user account (inactive until company is approved)
    const userResult = await client.query(
      `INSERT INTO users 
        (email, phone, password_hash, first_name, last_name, company_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING id, email, first_name, last_name, company_id`,
      [user_email, user_phone, passwordHash, first_name, last_name, company.id]
    );
    
    const user = userResult.rows[0];
    
    // Assign 'Agent' role to company user
    const agentRole = await client.query(
      "SELECT id FROM roles WHERE name = 'Agent'"
    );
    
    if (agentRole.rows.length > 0) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [user.id, agentRole.rows[0].id]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Company registration submitted successfully. Your account will be activated once approved by admin.',
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        cr_number: company.cr_number
      },
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error registering company:', error);
    res.status(500).json({ error: 'Failed to register company', details: error.message });
  } finally {
    client.release();
  }
});

export default router;
