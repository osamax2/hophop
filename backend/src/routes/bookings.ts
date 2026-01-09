import { Router } from "express";
import { pool } from "../db";
import { requireAuth, optionalAuth, AuthedRequest } from "../middleware/auth";
import { emailService } from "../services/email";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { bookingLimiter, guestBookingLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * POST /api/bookings
 * body: { trip_id, quantity, guest_name?, guest_email?, guest_phone? }
 * Supports both authenticated users and guest bookings
 * Protected by rate limiting to prevent abuse
 */
router.post("/", bookingLimiter, optionalAuth, async (req: AuthedRequest, res) => {
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

    // 7) إنشاء booking mit Status-Token - All bookings start as 'pending'
    const bookingStatus = 'pending';
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
        statusUrl: statusLink,
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

/**
 * GET /api/bookings/my
 * Get all bookings for the authenticated user
 */
router.get("/my", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
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
        b.created_at,
        b.trip_id,
        b.status_token,
        t.departure_time,
        t.arrival_time,
        fc.name as from_city,
        tc.name as to_city,
        comp.name as company_name
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      LEFT JOIN routes r ON r.id = t.route_id
      LEFT JOIN cities fc ON fc.id = r.from_city_id
      LEFT JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN transport_companies comp ON comp.id = t.company_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: String(error) });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking and send notification emails
 */
router.post("/:id/cancel", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  const bookingId = parseInt(req.params.id);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get booking details with user and company information
    const bookingResult = await client.query(
      `
      SELECT 
        b.id,
        b.user_id,
        b.trip_id,
        b.booking_status,
        b.seats_booked,
        b.total_price,
        b.currency,
        b.guest_name,
        b.guest_email,
        t.departure_time,
        t.arrival_time,
        fc.name as from_city,
        tc.name as to_city,
        comp.name as company_name,
        comp.email as company_email,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      LEFT JOIN routes r ON r.id = t.route_id
      LEFT JOIN cities fc ON fc.id = r.from_city_id
      LEFT JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN transport_companies comp ON comp.id = t.company_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.id = $1
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    // Check if user owns this booking
    if (booking.user_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.booking_status.toLowerCase())) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Booking cannot be cancelled" });
    }

    // Check if trip is in the future
    const tripDate = new Date(booking.departure_time);
    const now = new Date();
    if (tripDate <= now) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cannot cancel past trips" });
    }

    // Note: Update booking status to indicate cancellation request
    // The company must manually approve the cancellation
    await client.query(
      "UPDATE bookings SET booking_status = 'cancellation_requested' WHERE id = $1",
      [bookingId]
    );
    
    await client.query("COMMIT");

    // Send cancellation emails
    const userName = booking.user_first_name && booking.user_last_name
      ? `${booking.user_first_name} ${booking.user_last_name}`
      : booking.guest_name || 'Customer';
    
    const userEmail = booking.user_email || booking.guest_email;
    
    const departureDate = new Date(booking.departure_time).toLocaleDateString();
    const departureTime = new Date(booking.departure_time).toLocaleTimeString();

    // Email to user
    if (userEmail) {
      const userSubject = 'Cancellation Request Received / طلب إلغاء تم استلامه';
      const userBody = `
        <h2>Cancellation Request Received</h2>
        <p>Dear ${userName},</p>
        <p>We have received your cancellation request for the following booking.</p>
        <p style="color: #856404; background-color: #fff3cd; padding: 12px; border-radius: 6px;">
          <strong>⏳ Pending Company Approval</strong><br>
          Your cancellation request is pending approval from ${booking.company_name}. 
          You will be notified once the company processes your request.
        </p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> #${booking.id}</li>
          <li><strong>Route:</strong> ${booking.from_city} → ${booking.to_city}</li>
          <li><strong>Company:</strong> ${booking.company_name}</li>
          <li><strong>Departure:</strong> ${departureDate} at ${departureTime}</li>
          <li><strong>Seats:</strong> ${booking.seats_booked}</li>
          <li><strong>Amount:</strong> ${booking.total_price} ${booking.currency}</li>
        </ul>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>HopHop Syria Team</p>
      `;

      try {
        await emailService.sendEmail(userEmail, userSubject, userBody);
      } catch (emailError) {
        console.error('Failed to send cancellation email to user:', emailError);
      }
    }

    // Email to company
    if (booking.company_email) {
      const companySubject = 'Cancellation Request - Action Required / طلب إلغاء - مطلوب إجراء';
      const companyBody = `
        <h2>⚠️ Cancellation Request - Action Required</h2>
        <p>Dear ${booking.company_name},</p>
        <p style="color: #721c24; background-color: #f8d7da; padding: 12px; border-radius: 6px;">
          <strong>A customer has requested to cancel their booking.</strong><br>
          Please review this request and take appropriate action in the admin panel.
        </p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> #${booking.id}</li>
          <li><strong>Customer:</strong> ${userName}</li>
          <li><strong>Customer Email:</strong> ${userEmail}</li>
          <li><strong>Route:</strong> ${booking.from_city} → ${booking.to_city}</li>
          <li><strong>Departure:</strong> ${departureDate} at ${departureTime}</li>
          <li><strong>Seats:</strong> ${booking.seats_booked}</li>
          <li><strong>Amount:</strong> ${booking.total_price} ${booking.currency}</li>
        </ul>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the cancellation request</li>
          <li>Contact the customer if needed</li>
          <li>Approve or reject the cancellation in the admin panel</li>
        </ol>
        <p>The booking status remains unchanged until you take action.</p>
        <p>Best regards,<br>HopHop Syria System</p>
      `;

      try {
        await emailService.sendEmail(booking.company_email, companySubject, companyBody);
      } catch (emailError) {
        console.error('Failed to send cancellation email to company:', emailError);
      }
    }

    res.json({ 
      message: "Cancellation request sent successfully. Awaiting company approval.",
      booking_id: bookingId,
      status: 'cancellation_requested' // Return new status
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking", error: String(error) });
  } finally {
    client.release();
  }
});


export default router;
