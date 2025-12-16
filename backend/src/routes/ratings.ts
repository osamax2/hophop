import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/ratings - Get ratings for a company (optional: company_id query param)
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

    query += ` ORDER BY r.created_at DESC LIMIT 100`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching ratings:", error);
    // If table doesn't exist, return empty array instead of 500
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn("Ratings table may not exist yet, returning empty array");
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching ratings", error: String(error) });
  }
});

// GET /api/ratings/company/:companyId - Get average ratings for a company
router.get("/company/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const result = await pool.query(
      `
      SELECT
        transport_company_id AS company_id,
        COUNT(*) AS total_ratings,
        ROUND(AVG(punctuality_rating), 2) AS avg_punctuality,
        ROUND(AVG(friendliness_rating), 2) AS avg_friendliness,
        ROUND(AVG(cleanliness_rating), 2) AS avg_cleanliness,
        ROUND(
          (AVG(punctuality_rating) + AVG(friendliness_rating) + AVG(cleanliness_rating)) / 3,
          2
        ) AS overall_average
      FROM ratings
      WHERE transport_company_id = $1
      GROUP BY transport_company_id
      `,
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.json({
        company_id: companyId,
        total_ratings: 0,
        avg_punctuality: 0,
        avg_friendliness: 0,
        avg_cleanliness: 0,
        overall_average: 0,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching company ratings:", error);
    res.status(500).json({ message: "Error fetching company ratings", error: String(error) });
  }
});

// POST /api/ratings - Submit a rating
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { company_id, punctuality_rating, friendliness_rating, cleanliness_rating, comment } =
      req.body;

    if (!company_id || !punctuality_rating || !friendliness_rating || !cleanliness_rating) {
      return res.status(400).json({
        message: "company_id, punctuality_rating, friendliness_rating, and cleanliness_rating are required",
      });
    }

    // Validate ratings are between 1-5
    if (
      punctuality_rating < 1 ||
      punctuality_rating > 5 ||
      friendliness_rating < 1 ||
      friendliness_rating > 5 ||
      cleanliness_rating < 1 ||
      cleanliness_rating > 5
    ) {
      return res.status(400).json({ message: "Ratings must be between 1 and 5" });
    }

    // Check if company exists
    const companyCheck = await pool.query("SELECT id FROM transport_companies WHERE id = $1", [company_id]);
    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user already rated this company (optional: allow only one rating per user per company)
    const existing = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND transport_company_id = $2",
      [userId, company_id]
    );

    if (existing.rows.length > 0) {
      // Update existing rating
      const result = await pool.query(
        `
        UPDATE ratings
        SET
          punctuality_rating = $1,
          friendliness_rating = $2,
          cleanliness_rating = $3,
          comment = $4,
          updated_at = NOW()
        WHERE user_id = $5 AND transport_company_id = $6
        RETURNING *
        `,
        [punctuality_rating, friendliness_rating, cleanliness_rating, comment || null, userId, company_id]
      );

      return res.json(result.rows[0]);
    }

    // Create new rating
    const result = await pool.query(
      `
      INSERT INTO ratings (
        user_id,
        transport_company_id,
        punctuality_rating,
        friendliness_rating,
        cleanliness_rating,
        comment
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [userId, company_id, punctuality_rating, friendliness_rating, cleanliness_rating, comment || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Error submitting rating", error: String(error) });
  }
});

export default router;

