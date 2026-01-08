import { Router } from "express";
import { authenticateToken, requireCompanyAdmin } from "../middleware/auth";
import { pool } from "../db";

const router = Router();

// Get all subscription plans (public)
router.get("/plans", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM subscription_plans 
       WHERE is_active = true 
       ORDER BY max_branches ASC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
});

// Get company's current subscription
router.get("/company/:companyId", authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const result = await pool.query(
      `SELECT cs.*, sp.name, sp.max_branches, sp.price_per_month, sp.currency, sp.features,
        (SELECT COUNT(*) FROM branches WHERE company_id = cs.company_id AND is_active = true) as current_branches
       FROM company_subscriptions cs
       JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
       WHERE cs.company_id = $1 AND cs.is_active = true
       ORDER BY cs.created_at DESC
       LIMIT 1`,
      [companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No active subscription found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching company subscription:", error);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

// Get subscription history for a company
router.get("/company/:companyId/history", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const result = await pool.query(
      `SELECT cs.*, sp.name, sp.max_branches, sp.price_per_month, sp.currency
       FROM company_subscriptions cs
       JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
       WHERE cs.company_id = $1
       ORDER BY cs.created_at DESC`,
      [companyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    res.status(500).json({ message: "Failed to fetch subscription history" });
  }
});

// Upgrade/Change subscription
router.post("/company/:companyId/upgrade", authenticateToken, requireCompanyAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { companyId } = req.params;
    const { subscription_plan_id } = req.body;
    
    if (!subscription_plan_id) {
      return res.status(400).json({ message: "Subscription plan ID is required" });
    }
    
    await client.query("BEGIN");
    
    // Deactivate current subscription
    await client.query(
      `UPDATE company_subscriptions 
       SET is_active = false, 
           end_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $1 AND is_active = true`,
      [companyId]
    );
    
    // Create new subscription
    const result = await client.query(
      `INSERT INTO company_subscriptions (company_id, subscription_plan_id, is_active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [companyId, subscription_plan_id]
    );
    
    await client.query("COMMIT");
    
    // Fetch full subscription details
    const subscriptionDetails = await pool.query(
      `SELECT cs.*, sp.name, sp.max_branches, sp.price_per_month, sp.currency, sp.features
       FROM company_subscriptions cs
       JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
       WHERE cs.id = $1`,
      [result.rows[0].id]
    );
    
    res.json(subscriptionDetails.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ message: "Failed to upgrade subscription" });
  } finally {
    client.release();
  }
});

// Get payment history
router.get("/company/:companyId/payments", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const result = await pool.query(
      `SELECT sp.*, cs.subscription_plan_id, spl.name as plan_name
       FROM subscription_payments sp
       JOIN company_subscriptions cs ON sp.company_subscription_id = cs.id
       JOIN subscription_plans spl ON cs.subscription_plan_id = spl.id
       WHERE cs.company_id = $1
       ORDER BY sp.created_at DESC`,
      [companyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});

// Record a payment
router.post("/payments", authenticateToken, requireCompanyAdmin, async (req, res) => {
  try {
    const { 
      company_subscription_id, 
      amount, 
      currency, 
      payment_method, 
      transaction_id,
      notes 
    } = req.body;
    
    if (!company_subscription_id || !amount) {
      return res.status(400).json({ message: "Subscription ID and amount are required" });
    }
    
    const result = await pool.query(
      `INSERT INTO subscription_payments 
        (company_subscription_id, amount, currency, payment_method, payment_status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, 'completed', $5, $6)
       RETURNING *`,
      [company_subscription_id, amount, currency || 'EUR', payment_method, transaction_id, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Failed to record payment" });
  }
});

// Get branch staff roles
router.get("/staff-roles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM branch_staff_roles ORDER BY id"
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching staff roles:", error);
    res.status(500).json({ message: "Failed to fetch staff roles" });
  }
});

export default router;
