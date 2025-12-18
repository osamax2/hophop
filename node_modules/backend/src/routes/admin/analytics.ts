import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/analytics/stats - Get overall statistics
router.get("/stats", async (_req, res) => {
  try {
    // Check if is_active column exists in trips table
    const tripsColumnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trips' AND column_name = 'is_active'
    `);
    const hasTripsIsActive = tripsColumnsResult.rows.length > 0;
    
    // Check if is_active column exists in users table
    const usersColumnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    const hasUsersIsActive = usersColumnsResult.rows.length > 0;
    
    // Total trips
    const tripsQuery = hasTripsIsActive 
      ? "SELECT COUNT(*) as count FROM trips WHERE is_active = true"
      : "SELECT COUNT(*) as count FROM trips";
    const tripsResult = await pool.query(tripsQuery);
    const totalTrips = parseInt(tripsResult.rows[0].count) || 0;

    // Total users
    const usersQuery = hasUsersIsActive
      ? "SELECT COUNT(*) as count FROM users WHERE is_active = true"
      : "SELECT COUNT(*) as count FROM users";
    const usersResult = await pool.query(usersQuery);
    const totalUsers = parseInt(usersResult.rows[0].count) || 0;

    // Average occupancy (seats booked / seats total)
    const occupancyWhere = hasTripsIsActive 
      ? "WHERE is_active = true AND seats_total > 0"
      : "WHERE seats_total > 0";
    
    const occupancyResult = await pool.query(
      `
      SELECT
        COALESCE(
          ROUND(
            AVG(
              CASE
                WHEN seats_total > 0 THEN
                  ((seats_total - seats_available)::FLOAT / seats_total::FLOAT) * 100
                ELSE 0
              END
            ),
            0
          ),
          0
        ) as avg_occupancy
      FROM trips
      ${occupancyWhere}
      `
    );
    const averageOccupancy = parseFloat(occupancyResult.rows[0]?.avg_occupancy || "0") || 0;

    res.json({
      totalTrips,
      totalUsers,
      averageOccupancy: Math.round(averageOccupancy),
    });
  } catch (error: any) {
    console.error("Error fetching analytics stats:", error);
    res.status(500).json({ message: "Error fetching analytics", error: String(error), details: error.message });
  }
});

// GET /api/admin/analytics/popular-routes - Get popular routes
router.get("/popular-routes", async (_req, res) => {
  try {
    // Check if is_active column exists
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trips' AND column_name = 'is_active'
    `);
    const hasIsActive = columnsResult.rows.length > 0;
    
    const whereClause = hasIsActive ? "WHERE t.is_active = true" : "";
    
    const result = await pool.query(
      `
      SELECT
        c_from.name || ' → ' || c_to.name AS route,
        COUNT(t.id) AS trip_count
      FROM trips t
      JOIN routes r ON t.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      ${whereClause}
      GROUP BY c_from.name, c_to.name
      ORDER BY trip_count DESC
      LIMIT 10
      `
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching popular routes:", error);
    res.status(500).json({ message: "Error fetching popular routes", error: String(error), details: error.message });
  }
});

// GET /api/admin/analytics/recent-bookings - Get recent bookings count
router.get("/recent-bookings", async (_req, res) => {
  try {
    // Check if created_at column exists
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'created_at'
    `);
    const hasCreatedAt = columnsResult.rows.length > 0;
    
    if (!hasCreatedAt) {
      // Return empty array if created_at doesn't exist
      return res.json([]);
    }
    
    const result = await pool.query(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
      `
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching recent bookings:", error);
    // Return empty array on error instead of 500
    res.json([]);
  }
});

export default router;

