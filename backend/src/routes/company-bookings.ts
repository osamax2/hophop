import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { emailService } from "../services/email";
import QRCode from 'qrcode';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api/company-bookings
 * Get all bookings for company's trips
 * Requires: company_admin or driver role
 */
router.get("/", requireAuth, requireRole(['company_admin', 'driver']), async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get company_id for this user
    const userResult = await pool.query(
      'SELECT company_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.company_id) {
      return res.status(403).json({ message: "No company associated with this user" });
    }

    const companyId = userResult.rows[0].company_id;

    // Get all bookings for trips operated by this company
    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.trip_id,
        b.seats_booked as quantity,
        b.total_price,
        b.booking_status as status,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.status_token,
        b.qr_code_data,
        b.created_at,
        b.updated_at,
        t.departure_time,
        t.arrival_time,
        r.id as route_id,
        fc.name as from_city,
        tc.name as to_city,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      JOIN cities fc ON fc.id = r.from_city_id
      JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE t.company_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [companyId]);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching company bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: String(error) });
  }
});

/**
 * PUT /api/company-bookings/:id/accept
 * Accept a pending booking and generate QR code
 * Requires: company_admin role
 */
router.put("/:id/accept", requireAuth, requireRole(['company_admin']), async (req: AuthedRequest, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user!.id;

    // Get user's company
    const userResult = await pool.query(
      'SELECT company_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.company_id) {
      return res.status(403).json({ message: "No company associated with this user" });
    }

    const companyId = userResult.rows[0].company_id;

    // Verify booking belongs to company's trip
    const bookingCheck = await pool.query(`
      SELECT b.*, t.company_id, t.departure_time, r.id as route_id,
             fc.name as from_city, tc.name as to_city,
             u.email as user_email, b.guest_email
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      JOIN cities fc ON fc.id = r.from_city_id
      JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.id = $1 AND t.company_id = $2
    `, [bookingId, companyId]);

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found or not authorized" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ message: "Booking is not in pending status" });
    }

    // Generate unique QR code data
    const qrData = crypto.randomBytes(32).toString('hex');

    // Update booking status to confirmed
    await pool.query(
      `UPDATE bookings 
       SET booking_status = 'confirmed', 
           qr_code_data = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [qrData, bookingId]
    );

    // Send confirmation email to user/guest
    const recipientEmail = booking.user_email || booking.guest_email;
    const recipientName = booking.user_email 
      ? (await pool.query('SELECT first_name FROM users WHERE id = $1', [booking.user_id])).rows[0]?.first_name
      : booking.guest_name;

    if (recipientEmail && emailService) {
      try {
        const statusUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/booking-status/${booking.status_token}`;
        
        // Generate QR code as data URL for email
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Get arrival time from trip
        const tripRes = await pool.query(
          'SELECT arrival_time, company_id FROM trips WHERE id = $1',
          [booking.trip_id]
        );
        const arrivalTime = tripRes.rows[0]?.arrival_time || booking.departure_time;
        
        // Get company name
        const companyRes = await pool.query(
          'SELECT name FROM transport_companies WHERE id = $1',
          [tripRes.rows[0]?.company_id]
        );
        const companyName = companyRes.rows[0]?.name || 'HopHop';
        
        await emailService.sendBookingConfirmation({
          recipientEmail,
          recipientName: recipientName || 'Guest',
          bookingId: bookingId,
          isGuestBooking: !booking.user_email,
          qrCodeDataUrl: qrCodeDataUrl,
          statusUrl: statusUrl,
          tripDetails: {
            from: booking.from_city,
            to: booking.to_city,
            departureTime: new Date(booking.departure_time).toLocaleString('de-DE'),
            arrivalTime: new Date(arrivalTime).toLocaleString('de-DE'),
            company: companyName,
            seats: booking.seats_booked,
            totalPrice: booking.total_price,
            currency: booking.currency
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({ 
      message: "Booking accepted successfully",
      bookingId,
      qrCodeData: qrData
    });
  } catch (error: any) {
    console.error("Error accepting booking:", error);
    res.status(500).json({ message: "Error accepting booking", error: String(error) });
  }
});

/**
 * PUT /api/company-bookings/:id/reject
 * Reject a pending booking
 * Requires: company_admin role
 */
router.put("/:id/reject", requireAuth, requireRole(['company_admin']), async (req: AuthedRequest, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { reason } = req.body;

    // Get user's company
    const userResult = await pool.query(
      'SELECT company_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.company_id) {
      return res.status(403).json({ message: "No company associated with this user" });
    }

    const companyId = userResult.rows[0].company_id;

    // Verify booking belongs to company's trip
    const bookingCheck = await pool.query(`
      SELECT b.*, t.company_id
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      WHERE b.id = $1 AND t.company_id = $2
    `, [bookingId, companyId]);

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found or not authorized" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ message: "Booking is not in pending status" });
    }

    // Update booking status to rejected
    await pool.query(
      `UPDATE bookings 
       SET booking_status = 'rejected', 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [bookingId]
    );

    // TODO: Send rejection email to user/guest with reason

    res.json({ 
      message: "Booking rejected successfully",
      bookingId
    });
  } catch (error: any) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Error rejecting booking", error: String(error) });
  }
});

/**
 * POST /api/company-bookings/verify-qr
 * Verify a booking QR code
 * Requires: company_admin or driver role
 */
router.post("/verify-qr", requireAuth, requireRole(['company_admin', 'driver']), async (req: AuthedRequest, res) => {
  try {
    const { qrData } = req.body;
    const userId = req.user!.id;

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required" });
    }

    // Get user's company
    const userResult = await pool.query(
      'SELECT company_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.company_id) {
      return res.status(403).json({ message: "No company associated with this user" });
    }

    const companyId = userResult.rows[0].company_id;

    // Find booking with this QR code that belongs to company's trips
    const result = await pool.query(`
      SELECT 
        b.id,
        b.seats_booked as quantity,
        b.booking_status as status,
        b.guest_name,
        t.departure_time,
        fc.name as from_city,
        tc.name as to_city,
        u.first_name || ' ' || u.last_name as user_name
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      JOIN cities fc ON fc.id = r.from_city_id
      JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.qr_code_data = $1 
        AND t.company_id = $2
        AND b.booking_status = 'confirmed'
    `, [qrData, companyId]);

    if (result.rows.length === 0) {
      return res.json({ 
        valid: false,
        message: "Invalid QR code or booking not confirmed"
      });
    }

    const booking = result.rows[0];

    // Mark booking as checked-in
    await pool.query(
      `UPDATE bookings 
       SET booking_status = 'checked_in',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [booking.id]
    );

    res.json({
      valid: true,
      message: "Booking verified successfully",
      booking: {
        id: booking.id,
        passengerName: booking.user_name || booking.guest_name,
        seats: booking.quantity,
        route: `${booking.from_city} → ${booking.to_city}`,
        departureTime: booking.departure_time
      }
    });
  } catch (error: any) {
    console.error("Error verifying QR code:", error);
    res.status(500).json({ message: "Error verifying QR code", error: String(error) });
  }
});

/**
 * GET /api/company-bookings/qr-image/:bookingId
 * Generate QR code image for a booking
 */
router.get("/qr-image/:bookingId", async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);

    const result = await pool.query(
      'SELECT qr_code_data FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (result.rows.length === 0 || !result.rows[0].qr_code_data) {
      return res.status(404).json({ message: "Booking not found or QR code not generated" });
    }

    const qrData = result.rows[0].qr_code_data;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error: any) {
    console.error("Error generating QR code image:", error);
    res.status(500).json({ message: "Error generating QR code", error: String(error) });
  }
});

export default router;
