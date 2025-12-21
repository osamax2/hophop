import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/analytics/stats - Get overall statistics
router.get("/stats", async (req, res) => {
  console.log("GET /api/admin/analytics/stats - Starting");
  
  let totalTrips = 0;
  let totalUsers = 0;
  let averageOccupancy = 0;

  // Total trips
  try {
    const result = await pool.query("SELECT COUNT(*) as count FROM trips WHERE is_active = true");
    totalTrips = parseInt(result.rows[0]?.count || "0") || 0;
  } catch (e: any) {
    try {
      const result = await pool.query("SELECT COUNT(*) as count FROM trips");
      totalTrips = parseInt(result.rows[0]?.count || "0") || 0;
    } catch (e2: any) {
      console.error("Error fetching trips:", e2?.message);
      totalTrips = 0;
    }
  }

  // Total users
  try {
    const result = await pool.query("SELECT COUNT(*) as count FROM users WHERE is_active = true");
    totalUsers = parseInt(result.rows[0]?.count || "0") || 0;
  } catch (e: any) {
    try {
      const result = await pool.query("SELECT COUNT(*) as count FROM users");
      totalUsers = parseInt(result.rows[0]?.count || "0") || 0;
    } catch (e2: any) {
      console.error("Error fetching users:", e2?.message);
      totalUsers = 0;
    }
  }

  // Average occupancy
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(
          ROUND(
            AVG(
              CASE
                WHEN seats_total > 0 THEN
                  ((seats_total - COALESCE(seats_available, 0))::FLOAT / seats_total::FLOAT) * 100
                ELSE 0
              END
            ),
            0
          ),
          0
        ) as avg_occupancy
      FROM trips
      WHERE seats_total > 0
    `);
    averageOccupancy = parseFloat(result.rows[0]?.avg_occupancy || "0") || 0;
  } catch (e: any) {
    console.error("Error calculating occupancy:", e?.message);
    averageOccupancy = 0;
  }

  console.log("GET /api/admin/analytics/stats - Success", { totalTrips, totalUsers, averageOccupancy });
  
  return res.json({
    totalTrips: totalTrips || 0,
    totalUsers: totalUsers || 0,
    averageOccupancy: Math.round(averageOccupancy) || 0,
  });
});

// GET /api/admin/analytics/popular-routes - Get popular routes
router.get("/popular-routes", async (req, res) => {
  try {
    let result;
    try {
      result = await pool.query(`
        SELECT
          COALESCE(c_from.name, 'Unknown') || ' → ' || COALESCE(c_to.name, 'Unknown') AS route,
          COUNT(t.id) AS trip_count
        FROM trips t
        JOIN routes r ON t.route_id = r.id
        LEFT JOIN cities c_from ON r.from_city_id = c_from.id
        LEFT JOIN cities c_to ON r.to_city_id = c_to.id
        WHERE t.is_active = true
        GROUP BY c_from.name, c_to.name
        ORDER BY trip_count DESC
        LIMIT 10
      `);
    } catch (e: any) {
      result = await pool.query(`
        SELECT
          COALESCE(c_from.name, 'Unknown') || ' → ' || COALESCE(c_to.name, 'Unknown') AS route,
          COUNT(t.id) AS trip_count
        FROM trips t
        JOIN routes r ON t.route_id = r.id
        LEFT JOIN cities c_from ON r.from_city_id = c_from.id
        LEFT JOIN cities c_to ON r.to_city_id = c_to.id
        GROUP BY c_from.name, c_to.name
        ORDER BY trip_count DESC
        LIMIT 10
      `);
    }

    const routes = result.rows.map((row: any) => ({
      route: row.route || 'Unknown Route',
      trip_count: parseInt(row.trip_count) || 0
    }));

    return res.json(routes);
  } catch (error: any) {
    console.error("Error fetching popular routes:", error?.message);
    return res.json([]);
  }
});

// GET /api/admin/analytics/recent-bookings - Get recent bookings count
router.get("/recent-bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    return res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching recent bookings:", error?.message);
    return res.json([]);
  }
});

export default router;
