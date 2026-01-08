import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { emailService } from "../services/email";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/bookings
 * body: { trip_id, quantity, guest_name?, guest_email?, guest_phone? }
 * Supports both authenticated users and guest bookings
 */
router.post("/", async (req: AuthedRequest, res) => {
  const userId = req.user?.id; // Optional for guest bookings

  const {
    trip_id,
    quantity,
    fare_category_code = "STANDARD",
    booking_option_code = "DEFAULT",
    guest_name,
    guest_email,
    guest_phone,
    passenger_names,
  } = req.body as {
    trip_id?: number;
    quantity?: number;
    fare_category_code?: string;
    booking_option_code?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    passenger_names?: string[];
  };

  if (!trip_id || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "trip_id and quantity (>0) are required" });
  }

  // Validate guest booking fields if not logged in
  const isGuestBooking = !userId;
  if (isGuestBooking) {
    if (!guest_name || !guest_email || !guest_phone) {
      return res.status(400).json({
        message: "Guest bookings require guest_name, guest_email, and guest_phone"
      });
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
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

    // 5) Fetch trip and company details for email
    const tripDetailsRes = await client.query(
      `
      SELECT
        t.id,
        t.departure_time,
        t.arrival_time,
        fc.name as from_city,
        tc.name as to_city,
        comp.name as company_name
      FROM trips t
      LEFT JOIN routes r ON r.id = t.route_id
      LEFT JOIN cities fc ON fc.id = r.from_city_id
      LEFT JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN transport_companies comp ON comp.id = t.company_id
      WHERE t.id = $1
      `,
      [trip_id]
    );

    const tripDetails = tripDetailsRes.rows[0];

    // 6) Generate encrypted status token for booking tracking
    const statusToken = crypto.randomBytes(32).toString('hex');

    // 7) إنشاء booking mit Status-Token
    const bookingStatus = isGuestBooking ? 'pending' : 'confirmed';
    const bookingRes = await client.query(
      `
      INSERT INTO bookings (
        user_id,
        trip_id,
        booking_status,
        seats_booked,
        total_price,
        currency,
        guest_name,
        guest_email,
        guest_phone,
        status_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id, user_id, trip_id, booking_status, seats_booked, total_price, currency, guest_name, guest_email, guest_phone, status_token, created_at
      `,
      [userId || null, trip_id, bookingStatus, quantity, totalPrice, currency, guest_name || null, guest_email || null, guest_phone || null, statusToken]
    );

    const newBooking = bookingRes.rows[0];

    // 8) Save passenger names
    if (passenger_names && passenger_names.length > 0) {
      for (let i = 0; i < passenger_names.length; i++) {
        await client.query(
          'INSERT INTO booking_passengers (booking_id, passenger_name, seat_number) VALUES ($1, $2, $3)',
          [newBooking.id, passenger_names[i], i + 1]
        );
      }
    }

    // Prepare customer information for both emails
    let recipientEmail: string;
    let recipientName: string;

    if (isGuestBooking) {
      recipientEmail = guest_email!;
      recipientName = guest_name!;
    } else {
      // Fetch user details
      const userRes = await client.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );
      const user = userRes.rows[0];
      recipientEmail = user.email;
      recipientName = `${user.first_name} ${user.last_name}`;
    }

    const statusLink = `${process.env.FRONTEND_URL || 'http://localhost'}/booking-status/${statusToken}`;

    // 9) Send email notification to customer
    try {
      await emailService.sendBookingConfirmation({
        recipientEmail,
        recipientName,
        bookingId: newBooking.id,
        isGuestBooking,
        tripDetails: {
          from: tripDetails.from_city,
          to: tripDetails.to_city,
          departureTime: new Date(tripDetails.departure_time).toLocaleString('de-DE'),
          arrivalTime: new Date(tripDetails.arrival_time).toLocaleString('de-DE'),
          company: tripDetails.company_name,
          seats: quantity,
          totalPrice: totalPrice,
          currency: currency,
        },
      });
    } catch (emailError) {
      console.error('Customer email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    // 10) Send email notification to company
    try {
      const companyRes = await client.query(
        'SELECT email, name FROM transport_companies WHERE id = (SELECT company_id FROM trips WHERE id = $1)',
        [trip_id]
      );
      
      if (companyRes.rows.length > 0) {
        const company = companyRes.rows[0];
        
        await emailService.sendCompanyNotification(
          company.email,
          company.name,
          {
            bookingId: newBooking.id,
            customerName: recipientName,
            customerEmail: recipientEmail,
            customerPhone: guest_phone || '',
            tripFrom: tripDetails.from_city,
            tripTo: tripDetails.to_city,
            departureTime: new Date(tripDetails.departure_time).toLocaleString('de-DE'),
            seats: quantity,
            passengerNames: passenger_names || [guest_name || 'Main Passenger'],
            totalPrice: totalPrice,
            currency: currency,
          }
        );
      }
    } catch (companyEmailError) {
      console.error('Company email sending failed:', companyEmailError);
      // Don't fail the booking if email fails
    }

    await client.query("COMMIT");
    return res.status(201).json({ 
      booking: newBooking,
      status_link: `${process.env.FRONTEND_URL || 'http://localhost'}/booking-status/${statusToken}`
    });
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
