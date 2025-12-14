import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

/**
 * POST /api/bookings
 * body: { trip_id, quantity }
 */
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  const {
    trip_id,
    quantity,
    fare_category_code = "STANDARD",
    booking_option_code = "DEFAULT",
  } = req.body as {
    trip_id?: number;
    quantity?: number;
    fare_category_code?: string;
    booking_option_code?: string;
  };

  if (!trip_id || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "trip_id and quantity (>0) are required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) اقفل صف الرحلة
    const tripRes = await client.query(
      `
      SELECT id, seats_available
      FROM trips
      WHERE id = $1
      FOR UPDATE
      `,
      [trip_id]
    );

    if (tripRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Trip not found" });
    }

    const tripSeats = Number(tripRes.rows[0].seats_available);
    if (quantity > tripSeats) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Not enough seats on trip",
        seats_available: tripSeats,
      });
    }

    // 2) اقفل صف السعر (trip_fares) حسب STANDARD + DEFAULT
    const fareRes = await client.query(
      `
      SELECT
        tf.id,
        tf.price,
        tf.currency,
        tf.seats_available,
        tf.fare_category_id,
        tf.booking_option_id
      FROM trip_fares tf
      JOIN fare_categories fc ON fc.id = tf.fare_category_id
      JOIN booking_options bo ON bo.id = tf.booking_option_id
      WHERE tf.trip_id = $1
        AND fc.code = $2
        AND bo.code = $3
      FOR UPDATE
      `,
      [trip_id, fare_category_code, booking_option_code]
    );

    if (fareRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "No matching fare found for this trip (check fare_category_code / booking_option_code)",
      });
    }

    const fare = fareRes.rows[0];
    const fareSeats = Number(fare.seats_available);

    if (quantity > fareSeats) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Not enough seats on fare",
        fare_seats_available: fareSeats,
      });
    }

    const price = Number(fare.price);
    const currency = String(fare.currency || "USD");
    const totalPrice = price * quantity;

    // 3) خصم المقاعد من trips
    await client.query(
      `
      UPDATE trips
      SET seats_available = seats_available - $1
      WHERE id = $2
      `,
      [quantity, trip_id]
    );

    // 4) خصم المقاعد من trip_fares
    await client.query(
      `
      UPDATE trip_fares
      SET seats_available = seats_available - $1
      WHERE id = $2
      `,
      [quantity, fare.id]
    );

    // 5) إنشاء booking (حسب أعمدتك)
    const bookingRes = await client.query(
      `
      INSERT INTO bookings (
        user_id,
        trip_id,
        booking_status,
        seats_booked,
        total_price,
        currency
      )
      VALUES ($1, $2, 'confirmed', $3, $4, $5)
      RETURNING
        id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at
      `,
      [userId, trip_id, quantity, totalPrice, currency]
    );

    await client.query("COMMIT");
    return res.status(201).json({ booking: bookingRes.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create booking error:", error);
    return res
      .status(500)
      .json({ message: "Create booking failed", error: String(error) });
  } finally {
    client.release();
  }
});


export default router;
