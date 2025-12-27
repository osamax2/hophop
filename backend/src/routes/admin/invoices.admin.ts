import { Router } from "express";
import { pool } from "../../db";
import { AuthedRequest } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/admin/invoices
 * List all invoices with filters and search
 * Query params:
 *  - booking_id: filter by booking
 *  - user_id: filter by user
 *  - status: filter by invoice status (pending, paid, overdue, cancelled)
 *  - payment_method: filter by payment method
 *  - showDeleted: 'true' to include soft-deleted invoices
 *  - search: search by invoice number, user name/email
 *  - from_date: filter by issue_date >= from_date
 *  - to_date: filter by issue_date <= to_date
 */
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const {
      booking_id,
      user_id,
      status,
      payment_method,
      showDeleted = "false",
      search = "",
      from_date,
      to_date,
    } = req.query as {
      booking_id?: string;
      user_id?: string;
      status?: string;
      payment_method?: string;
      showDeleted?: string;
      search?: string;
      from_date?: string;
      to_date?: string;
    };

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by deleted status
    if (showDeleted === "true") {
      // Show all including deleted
    } else {
      conditions.push(`i.deleted_at IS NULL`);
    }

    // Filter by booking
    if (booking_id) {
      conditions.push(`i.booking_id = $${paramIndex}`);
      params.push(parseInt(booking_id));
      paramIndex++;
    }

    // Filter by user
    if (user_id) {
      conditions.push(`b.user_id = $${paramIndex}`);
      params.push(parseInt(user_id));
      paramIndex++;
    }

    // Filter by status
    if (status) {
      conditions.push(`i.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filter by payment method
    if (payment_method) {
      conditions.push(`i.payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }

    // Filter by date range
    if (from_date) {
      conditions.push(`i.issue_date >= $${paramIndex}`);
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      conditions.push(`i.issue_date <= $${paramIndex}`);
      params.push(to_date);
      paramIndex++;
    }

    // Search by invoice number, user name/email
    if (search.trim()) {
      conditions.push(
        `(i.invoice_number ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        i.id,
        i.booking_id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.amount,
        i.currency,
        i.status,
        i.payment_method,
        i.payment_date,
        i.created_at,
        i.deleted_at,
        b.user_id,
        u.username AS user_name,
        u.email AS user_email,
        b.booking_status,
        b.seats_booked,
        t.company_id,
        tc.name AS company_name
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      ${whereClause}
      ORDER BY i.issue_date DESC
    `;

    const result = await pool.query(query, params);

    // Convert numeric fields from string to number
    const invoices = result.rows.map((invoice) => ({
      ...invoice,
      amount: parseFloat(invoice.amount),
    }));

    res.json({
      invoices,
      total: invoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/admin/invoices/:id
 * Get single invoice details
 */
router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        i.id,
        i.booking_id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.amount,
        i.currency,
        i.status,
        i.payment_method,
        i.payment_date,
        i.created_at,
        i.deleted_at,
        b.user_id,
        u.username AS user_name,
        u.email AS user_email,
        b.booking_status,
        b.seats_booked,
        b.total_price AS booking_total,
        t.company_id,
        tc.name AS company_name
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      WHERE i.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
      booking_total: result.rows[0].booking_total
        ? parseFloat(result.rows[0].booking_total)
        : null,
    };

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/admin/invoices/:id
 * Update invoice details
 * Body: { status?, payment_method?, payment_date?, amount?, due_date? }
 */
router.patch("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, payment_date, amount, due_date } =
      req.body;

    // Check if invoice exists and is not deleted
    const checkQuery = `
      SELECT id, deleted_at FROM invoices WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (checkResult.rows[0].deleted_at) {
      return res
        .status(400)
        .json({ message: "Cannot update deleted invoice" });
    }

    // Validate status
    const validStatuses = ["pending", "paid", "overdue", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate amount
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ message: "Amount cannot be negative" });
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (payment_method !== undefined) {
      updates.push(`payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }

    if (payment_date !== undefined) {
      updates.push(`payment_date = $${paramIndex}`);
      params.push(payment_date);
      paramIndex++;
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex}`);
      params.push(amount);
      paramIndex++;
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(due_date);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);

    const updateQuery = `
      UPDATE invoices
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
    };

    res.json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/admin/invoices/:id
 * Soft delete or permanently delete an invoice
 * Query params:
 *  - permanent: 'true' for hard delete, otherwise soft delete
 */
router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { permanent = "false" } = req.query as { permanent?: string };

    if (permanent === "true") {
      // Permanent delete
      const deleteQuery = `
        DELETE FROM invoices WHERE id = $1 RETURNING id
      `;
      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json({
        message: "Invoice permanently deleted",
        id: result.rows[0].id,
      });
    } else {
      // Soft delete
      const updateQuery = `
        UPDATE invoices
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `;
      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Invoice not found or already deleted" });
      }

      res.json({
        message: "Invoice soft deleted successfully",
        id: result.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/admin/invoices/:id/restore
 * Restore a soft-deleted invoice
 */
router.post("/:id/restore", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const updateQuery = `
      UPDATE invoices
      SET deleted_at = NULL
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Invoice not found or not deleted" });
    }

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
    };

    res.json({
      message: "Invoice restored successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error restoring invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
