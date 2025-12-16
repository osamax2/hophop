import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/favorites - Get user's favorite trips
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `
      SELECT
        f.id,
        f.trip_id,
        f.created_at,
        t.departure_time,
        t.arrival_time,
        t.duration_minutes,
        t.seats_available,
        c_from.name AS from_city,
        c_to.name AS to_city,
        s_from.name AS departure_station,
        s_to.name AS arrival_station,
        MIN(tf.price) AS price,
        MIN(tf.currency) AS currency,
        co.name AS company_name
      FROM favorites f
      JOIN trips t ON f.trip_id = t.id
      JOIN routes r ON t.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      JOIN stations s_from ON t.departure_station_id = s_from.id
      JOIN stations s_to ON t.arrival_station_id = s_to.id
      LEFT JOIN transport_companies co ON t.company_id = co.id
      LEFT JOIN trip_fares tf ON tf.trip_id = t.id
      WHERE f.user_id = $1
      GROUP BY f.id, f.trip_id, f.created_at, t.departure_time, t.arrival_time,
               t.duration_minutes, t.seats_available, c_from.name, c_to.name,
               s_from.name, s_to.name, co.name
      ORDER BY f.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Error fetching favorites", error: String(error) });
  }
});

// POST /api/favorites - Add trip to favorites
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { trip_id } = req.body;

    if (!trip_id) {
      return res.status(400).json({ message: "trip_id is required" });
    }

    // Check if trip exists
    const tripCheck = await pool.query("SELECT id FROM trips WHERE id = $1", [trip_id]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if already favorited
    const existing = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND trip_id = $2",
      [userId, trip_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Trip already in favorites" });
    }

    const result = await pool.query(
      `
      INSERT INTO favorites (user_id, trip_id)
      VALUES ($1, $2)
      RETURNING id, trip_id, created_at
      `,
      [userId, trip_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Error adding favorite", error: String(error) });
  }
});

// DELETE /api/favorites/:tripId - Remove trip from favorites
router.delete("/:tripId", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const tripId = parseInt(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const result = await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND trip_id = $2 RETURNING id",
      [userId, tripId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ ok: true, message: "Favorite removed" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Error removing favorite", error: String(error) });
  }
});

// GET /api/favorites/check/:tripId - Check if trip is favorited
router.get("/check/:tripId", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const tripId = parseInt(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const result = await pool.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND trip_id = $2",
      [userId, tripId]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ message: "Error checking favorite", error: String(error) });
  }
});

export default router;

