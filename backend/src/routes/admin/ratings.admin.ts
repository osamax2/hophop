import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/ratings - Get all ratings (admin only)
router.get("/", async (req, res) => {
  try {
    const { company_id } = req.query;

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
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN transport_companies co ON r.transport_company_id = co.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (company_id) {
      query += ` AND r.transport_company_id = $${values.length + 1}`;
      values.push(company_id);
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Error fetching ratings", error: String(error) });
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
      if (punctuality_rating < 1 || punctuality_rating > 5) {
        return res.status(400).json({ message: "punctuality_rating must be between 1 and 5" });
      }
    }
    if (friendliness_rating !== undefined) {
      if (friendliness_rating < 1 || friendliness_rating > 5) {
        return res.status(400).json({ message: "friendliness_rating must be between 1 and 5" });
      }
    }
    if (cleanliness_rating !== undefined) {
      if (cleanliness_rating < 1 || cleanliness_rating > 5) {
        return res.status(400).json({ message: "cleanliness_rating must be between 1 and 5" });
      }
    }

    // Check if rating exists
    const ratingCheck = await pool.query("SELECT id FROM ratings WHERE id = $1", [ratingId]);
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (punctuality_rating !== undefined) {
      updates.push(`punctuality_rating = $${paramIndex++}`);
      values.push(punctuality_rating);
    }
    if (friendliness_rating !== undefined) {
      updates.push(`friendliness_rating = $${paramIndex++}`);
      values.push(friendliness_rating);
    }
    if (cleanliness_rating !== undefined) {
      updates.push(`cleanliness_rating = $${paramIndex++}`);
      values.push(cleanliness_rating);
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

    const result = await pool.query(updateQuery, values);

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
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        co.name AS company_name
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

// DELETE /api/admin/ratings/:id - Delete a rating (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    // Check if rating exists
    const ratingCheck = await pool.query("SELECT id FROM ratings WHERE id = $1", [ratingId]);
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Delete the rating
    await pool.query("DELETE FROM ratings WHERE id = $1", [ratingId]);

    res.json({ message: "Rating deleted successfully", id: ratingId });
  } catch (error: any) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Error deleting rating", error: String(error) });
  }
});

export default router;

