import { Router } from "express";
import { tripsController } from "../controllers/trips.controller";
import { pool } from "../db";

const router = Router();

/**
 * GET /api/trips-crud/sponsored
 * Get sponsored trips for homepage ads
 */
router.get("/sponsored", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.departure_time,
        t.arrival_time,
        t.duration_minutes,
        t.seats_available,
        t.seats_total,
        t.status,
        t.is_sponsored,
        t.sponsored_until,
        t.price,
        t.currency,
        c1.name as origin_name,
        c2.name as destination_name,
        COALESCE(comp.name, 'Unknown') AS company_name,
        tt.label as transport_type,
        COALESCE((
          SELECT tf.price FROM trip_fares tf 
          WHERE tf.trip_id = t.id 
          ORDER BY tf.price ASC
          LIMIT 1
        ), t.price, 0) as price,
        COALESCE((
          SELECT tf.currency FROM trip_fares tf 
          WHERE tf.trip_id = t.id 
          ORDER BY tf.price ASC
          LIMIT 1
        ), t.currency, 'SYP') as currency
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      JOIN cities c1 ON c1.id = r.from_city_id
      JOIN cities c2 ON c2.id = r.to_city_id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      WHERE t.is_sponsored = TRUE 
        AND (t.sponsored_until IS NULL OR t.sponsored_until > NOW())
        AND t.status = 'scheduled'
        AND t.departure_time > NOW()
        AND t.seats_available > 0
      ORDER BY t.departure_time ASC
      LIMIT 6
    `);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching sponsored trips:", error);
    res.status(500).json({ 
      message: "Error fetching sponsored trips", 
      error: error.message || String(error)
    });
  }
});

/**
 * GET /api/trips-crud
 * الحصول على جميع الرحلات أو البحث
 */
router.get("/", (req, res) => tripsController.getAll(req, res));

/**
 * GET /api/trips-crud/:id
 * الحصول على رحلة بواسطة ID
 */
router.get("/:id", (req, res) => tripsController.getById(req, res));

/**
 * POST /api/trips-crud
 * إنشاء رحلة جديدة
 */
router.post("/", (req, res) => tripsController.create(req, res));

/**
 * PATCH /api/trips-crud/:id
 * تحديث رحلة
 */
router.patch("/:id", (req, res) => tripsController.update(req, res));

/**
 * DELETE /api/trips-crud/:id
 * حذف رحلة
 */
router.delete("/:id", (req, res) => tripsController.delete(req, res));

export default router;
