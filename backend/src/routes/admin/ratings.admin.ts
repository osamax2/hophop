import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/ratings - Get all ratings with filters (admin only)
router.get("/", async (req, res) => {
  try {
    const { company_id, user_id, showDeleted, search, min_rating, max_rating } = req.query;

    let query = `
      SELECT
        r.id,
        r.user_id,
        r.transport_company_id AS company_id,
        r.punctuality_rating,
        r.friendliness_rating,
        r.cleanliness_rating,
        r.comment,
        r.created_at,
        r.updated_at,
        r.deleted_at,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name,
        ROUND((COALESCE(r.punctuality_rating, 0) + COALESCE(r.friendliness_rating, 0) + COALESCE(r.cleanliness_rating, 0)) / 3.0, 2) AS average_rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN transport_companies co ON r.transport_company_id = co.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    // Filter by deleted status
    if (showDeleted === 'true') {
      query += ` AND r.deleted_at IS NOT NULL`;
    } else {
      query += ` AND r.deleted_at IS NULL`;
    }

    // Filter by company
    if (company_id) {
      query += ` AND r.transport_company_id = $${paramIndex++}`;
      values.push(company_id);
    }

    // Filter by user
    if (user_id) {
      query += ` AND r.user_id = $${paramIndex++}`;
      values.push(user_id);
    }

    // Search in user name, company name, or comment
    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` AND (
        LOWER(u.first_name || ' ' || u.last_name) LIKE LOWER($${paramIndex})
        OR LOWER(u.email) LIKE LOWER($${paramIndex})
        OR LOWER(co.name) LIKE LOWER($${paramIndex})
        OR LOWER(r.comment) LIKE LOWER($${paramIndex})
      )`;
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, values);
    
    // Filter by average rating if specified (client-side filter after calculation)
    let filteredRows = result.rows;
    if (min_rating) {
      const minVal = parseFloat(min_rating as string);
      if (!isNaN(minVal)) {
        filteredRows = filteredRows.filter(row => row.average_rating >= minVal);
      }
    }
    if (max_rating) {
      const maxVal = parseFloat(max_rating as string);
      if (!isNaN(maxVal)) {
        filteredRows = filteredRows.filter(row => row.average_rating <= maxVal);
      }
    }

    res.json(filteredRows);
  } catch (error: any) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Error fetching ratings", error: String(error) });
  }
});

// GET /api/admin/ratings/:id - Get single rating details (admin only)
router.get("/:id", async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    const result = await pool.query(
      `
      SELECT
        r.id,
        r.user_id,
        r.transport_company_id AS company_id,
        r.punctuality_rating,
        r.friendliness_rating,
        r.cleanliness_rating,
        r.comment,
        r.created_at,
        r.updated_at,
        r.deleted_at,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name,
        ROUND((COALESCE(r.punctuality_rating, 0) + COALESCE(r.friendliness_rating, 0) + COALESCE(r.cleanliness_rating, 0)) / 3.0, 2) AS average_rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN transport_companies co ON r.transport_company_id = co.id
      WHERE r.id = $1
      `,
      [ratingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error fetching rating:", error);
    res.status(500).json({ message: "Error fetching rating", error: String(error) });
  }
});

// PATCH /api/admin/ratings/:id - Update a rating (admin only)
router.patch("/:id", async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    const { punctuality_rating, friendliness_rating, cleanliness_rating, comment } = req.body;

    // Validate ratings if provided
    if (punctuality_rating !== undefined) {
      const rating = parseInt(punctuality_rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "punctuality_rating must be between 1 and 5" });
      }
    }
    if (friendliness_rating !== undefined) {
      const rating = parseInt(friendliness_rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "friendliness_rating must be between 1 and 5" });
      }
    }
    if (cleanliness_rating !== undefined) {
      const rating = parseInt(cleanliness_rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "cleanliness_rating must be between 1 and 5" });
      }
    }

    // Check if rating exists and is not deleted
    const ratingCheck = await pool.query(
      "SELECT id, deleted_at FROM ratings WHERE id = $1",
      [ratingId]
    );
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }
    if (ratingCheck.rows[0].deleted_at) {
      return res.status(400).json({ message: "Cannot edit deleted rating. Restore it first." });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (punctuality_rating !== undefined) {
      updates.push(`punctuality_rating = $${paramIndex++}`);
      values.push(parseInt(punctuality_rating));
    }
    if (friendliness_rating !== undefined) {
      updates.push(`friendliness_rating = $${paramIndex++}`);
      values.push(parseInt(friendliness_rating));
    }
    if (cleanliness_rating !== undefined) {
      updates.push(`cleanliness_rating = $${paramIndex++}`);
      values.push(parseInt(cleanliness_rating));
    }
    if (comment !== undefined) {
      updates.push(`comment = $${paramIndex++}`);
      values.push(comment || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);
    values.push(ratingId);

    const updateQuery = `
      UPDATE ratings
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    await pool.query(updateQuery, values);

    // Fetch updated rating with user and company info
    const updatedRating = await pool.query(
      `
      SELECT
        r.id,
        r.user_id,
        r.transport_company_id AS company_id,
        r.punctuality_rating,
        r.friendliness_rating,
        r.cleanliness_rating,
        r.comment,
        r.created_at,
        r.updated_at,
        r.deleted_at,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name,
        ROUND((COALESCE(r.punctuality_rating, 0) + COALESCE(r.friendliness_rating, 0) + COALESCE(r.cleanliness_rating, 0)) / 3.0, 2) AS average_rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN transport_companies co ON r.transport_company_id = co.id
      WHERE r.id = $1
      `,
      [ratingId]
    );

    res.json(updatedRating.rows[0]);
  } catch (error: any) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Error updating rating", error: String(error) });
  }
});

// DELETE /api/admin/ratings/:id - Soft or permanent delete a rating (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    const { permanent } = req.query;

    // Check if rating exists
    const ratingCheck = await pool.query(
      "SELECT id, deleted_at FROM ratings WHERE id = $1",
      [ratingId]
    );
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (permanent === 'true') {
      // Permanent delete
      await pool.query("DELETE FROM ratings WHERE id = $1", [ratingId]);
      res.json({ message: "Rating permanently deleted", id: ratingId });
    } else {
      // Soft delete
      if (ratingCheck.rows[0].deleted_at) {
        return res.status(400).json({ message: "Rating is already deleted" });
      }
      
      await pool.query(
        "UPDATE ratings SET deleted_at = NOW() WHERE id = $1",
        [ratingId]
      );
      res.json({ message: "Rating soft deleted successfully", id: ratingId });
    }
  } catch (error: any) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Error deleting rating", error: String(error) });
  }
});

// POST /api/admin/ratings/:id/restore - Restore a soft deleted rating (admin only)
router.post("/:id/restore", async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    // Check if rating exists and is deleted
    const ratingCheck = await pool.query(
      "SELECT id, deleted_at FROM ratings WHERE id = $1",
      [ratingId]
    );
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }
    if (!ratingCheck.rows[0].deleted_at) {
      return res.status(400).json({ message: "Rating is not deleted" });
    }

    // Restore the rating
    await pool.query(
      "UPDATE ratings SET deleted_at = NULL WHERE id = $1",
      [ratingId]
    );

    // Fetch restored rating with details
    const restoredRating = await pool.query(
      `
      SELECT
        r.id,
        r.user_id,
        r.transport_company_id AS company_id,
        r.punctuality_rating,
        r.friendliness_rating,
        r.cleanliness_rating,
        r.comment,
        r.created_at,
        r.updated_at,
        r.deleted_at,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name,
        ROUND((COALESCE(r.punctuality_rating, 0) + COALESCE(r.friendliness_rating, 0) + COALESCE(r.cleanliness_rating, 0)) / 3.0, 2) AS average_rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN transport_companies co ON r.transport_company_id = co.id
      WHERE r.id = $1
      `,
      [ratingId]
    );

    res.json({
      message: "Rating restored successfully",
      rating: restoredRating.rows[0]
    });
  } catch (error: any) {
    console.error("Error restoring rating:", error);
    res.status(500).json({ message: "Error restoring rating", error: String(error) });
  }
});

export default router;

