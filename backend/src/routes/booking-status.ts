import { Router } from "express";
import { pool } from "../db";

const router = Router();

/**
 * GET /api/booking-status/:token
 * Public route to check booking status via encrypted token
 */
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.booking_status,
        b.seats_booked,
        b.total_price,
        b.currency,
        b.guest_name,
        b.guest_email,
        b.created_at,
        t.departure_time,
        t.arrival_time,
        fc.name as from_city,
        fc.name as from_city_de,
        fc.name as from_city_ar,
        tc.name as to_city,
        tc.name as to_city_de,
        tc.name as to_city_ar,
        comp.name as company_name,
        comp.phone as company_phone,
        comp.email as company_email,
        COALESCE(
          json_agg(
            json_build_object(
              'name', bp.passenger_name,
              'seat_number', bp.seat_number
            ) ORDER BY bp.seat_number
          ) FILTER (WHERE bp.id IS NOT NULL),
          '[]'
        ) as passengers
      FROM bookings b
      LEFT JOIN trips t ON t.id = b.trip_id
      LEFT JOIN routes r ON r.id = t.route_id
      LEFT JOIN cities fc ON fc.id = r.from_city_id
      LEFT JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN transport_companies comp ON comp.id = t.company_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id
      WHERE b.status_token = $1
      GROUP BY b.id, t.id, fc.id, tc.id, comp.id
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking: result.rows[0] });
  } catch (error) {
    console.error("Booking status check error:", error);
    return res.status(500).json({ message: "Failed to retrieve booking status" });
  }
});

/**
 * GET /api/booking-status/user/:userId
 * Get all bookings for a logged-in user
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.booking_status,
        b.seats_booked,
        b.total_price,
        b.currency,
        b.status_token,
        b.created_at,
        t.departure_time,
        t.arrival_time,
        fc.name as from_city,
        fc.name as from_city_de,
        fc.name as from_city_ar,
        tc.name as to_city,
        tc.name as to_city_de,
        tc.name as to_city_ar,
        comp.name as company_name,
        COALESCE(
          json_agg(
            json_build_object(
              'name', bp.passenger_name,
              'seat_number', bp.seat_number
            ) ORDER BY bp.seat_number
          ) FILTER (WHERE bp.id IS NOT NULL),
          '[]'
        ) as passengers
      FROM bookings b
      LEFT JOIN trips t ON t.id = b.trip_id
      LEFT JOIN routes r ON r.id = t.route_id
      LEFT JOIN cities fc ON fc.id = r.from_city_id
      LEFT JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN transport_companies comp ON comp.id = t.company_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id
      WHERE b.user_id = $1
      GROUP BY b.id, t.id, fc.id, tc.id, comp.id
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ bookings: result.rows });
  } catch (error) {
    console.error("User bookings fetch error:", error);
    return res.status(500).json({ message: "Failed to retrieve user bookings" });
  }
});

export default router;
