import { Router } from "express";
import { pool } from "../../db";
import { AuthedRequest } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/admin/bookings
 * List all bookings with filters and search
 * Query params:
 *  - user_id: filter by user
 *  - trip_id: filter by trip
 *  - company_id: filter by company
 *  - status: filter by booking status (pending, confirmed, completed, cancelled)
 *  - showDeleted: 'true' to include soft-deleted bookings
 *  - search: search by user name/email
 *  - from_date: filter by created_at >= from_date
 *  - to_date: filter by created_at <= to_date
 */
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const {
      user_id,
      trip_id,
      company_id,
      status,
      showDeleted = "false",
      search = "",
      from_date,
      to_date,
    } = req.query as {
      user_id?: string;
      trip_id?: string;
      company_id?: string;
      status?: string;
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
      conditions.push(`b.deleted_at IS NULL`);
    }

    // Filter by user
    if (user_id) {
      conditions.push(`b.user_id = $${paramIndex}`);
      params.push(parseInt(user_id));
      paramIndex++;
    }

    // Filter by trip
    if (trip_id) {
      conditions.push(`b.trip_id = $${paramIndex}`);
      params.push(parseInt(trip_id));
      paramIndex++;
    }

    // Filter by company
    if (company_id) {
      conditions.push(`t.company_id = $${paramIndex}`);
      params.push(parseInt(company_id));
      paramIndex++;
    }

    // Filter by status
    if (status) {
      conditions.push(`b.booking_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filter by date range
    if (from_date) {
      conditions.push(`b.created_at >= $${paramIndex}`);
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      conditions.push(`b.created_at <= $${paramIndex}`);
      params.push(to_date);
      paramIndex++;
    }

    // Search by user name/email
    if (search.trim()) {
      conditions.push(
        `(CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.trip_id,
        b.booking_status,
        b.seats_booked,
        b.total_price,
        b.currency,
        b.created_at,
        b.deleted_at,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        t.departure_time,
        t.arrival_time,
        t.company_id,
        tc.name AS company_name,
        fc.name AS from_city,
        toc.name AS to_city
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      LEFT JOIN routes r ON t.route_id = r.id
      LEFT JOIN cities fc ON r.from_city_id = fc.id
      LEFT JOIN cities toc ON r.to_city_id = toc.id
      ${whereClause}
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, params);

    // Convert numeric fields from string to number
    const bookings = result.rows.map((booking) => ({
      ...booking,
      total_price: parseFloat(booking.total_price),
    }));

    res.json({
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/admin/bookings/:id
 * Get single booking details
 */
router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.trip_id,
        b.booking_status,
        b.seats_booked,
        b.total_price,
        b.currency,
        b.created_at,
        b.deleted_at,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        t.departure_time,
        t.arrival_time,
        t.company_id,
        tc.name AS company_name,
        fc.name AS from_city,
        toc.name AS to_city
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      LEFT JOIN routes r ON t.route_id = r.id
      LEFT JOIN cities fc ON r.from_city_id = fc.id
      LEFT JOIN cities toc ON r.to_city_id = toc.id
      WHERE b.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = {
      ...result.rows[0],
      total_price: parseFloat(result.rows[0].total_price),
    };

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/admin/bookings/:id
 * Update booking details
 * Body: { booking_status?, seats_booked?, total_price? }
 */
router.patch("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { booking_status, seats_booked, total_price } = req.body;

    // Check if booking exists and is not deleted
    const checkQuery = `
      SELECT id, deleted_at FROM bookings WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (checkResult.rows[0].deleted_at) {
      return res
        .status(400)
        .json({ message: "Cannot update deleted booking" });
    }

    // Validate booking_status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (booking_status && !validStatuses.includes(booking_status)) {
      return res.status(400).json({
        message: `Invalid booking status. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Validate seats_booked
    if (seats_booked !== undefined && seats_booked < 1) {
      return res
        .status(400)
        .json({ message: "Seats booked must be at least 1" });
    }

    // Validate total_price
    if (total_price !== undefined && total_price < 0) {
      return res
        .status(400)
        .json({ message: "Total price cannot be negative" });
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (booking_status !== undefined) {
      updates.push(`booking_status = $${paramIndex}`);
      params.push(booking_status);
      paramIndex++;
    }

    if (seats_booked !== undefined) {
      updates.push(`seats_booked = $${paramIndex}`);
      params.push(seats_booked);
      paramIndex++;
    }

    if (total_price !== undefined) {
      updates.push(`total_price = $${paramIndex}`);
      params.push(total_price);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);

    const updateQuery = `
      UPDATE bookings
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    const booking = {
      ...result.rows[0],
      total_price: parseFloat(result.rows[0].total_price),
    };

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/admin/bookings/:id
 * Soft delete or permanently delete a booking
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
        DELETE FROM bookings WHERE id = $1 RETURNING id
      `;
      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        message: "Booking permanently deleted",
        id: result.rows[0].id,
      });
    } else {
      // Soft delete
      const updateQuery = `
        UPDATE bookings
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `;
      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Booking not found or already deleted" });
      }

      res.json({
        message: "Booking soft deleted successfully",
        id: result.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/admin/bookings/:id/restore
 * Restore a soft-deleted booking
 */
router.post("/:id/restore", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const updateQuery = `
      UPDATE bookings
      SET deleted_at = NULL
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Booking not found or not deleted" });
    }

    const booking = {
      ...result.rows[0],
      total_price: parseFloat(result.rows[0].total_price),
    };

    res.json({
      message: "Booking restored successfully",
      booking,
    });
  } catch (error) {
    console.error("Error restoring booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
