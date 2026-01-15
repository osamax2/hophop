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
 * Requires: admin, company_admin, driver, or driver_assistant role
 */
router.get("/", requireAuth, requireRole(['admin', 'company_admin', 'driver', 'driver_assistant']), async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get company_id and roles for this user
    const userResult = await pool.query(
      `SELECT u.company_id, ARRAY_AGG(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id, u.company_id`,
      [userId]
    );

    const userData = userResult.rows[0];
    const isAdmin = userData?.roles?.includes('admin');
    const companyId = userData?.company_id;

    // Admin can see all bookings, company users only their company's bookings
    let query: string;
    let queryParams: any[];

    if (isAdmin) {
      // Admin sees ALL bookings
      query = `
        SELECT 
          b.id,
          b.user_id,
          b.trip_id,
          b.seats_booked,
          b.total_price,
          b.currency,
          b.booking_status,
          b.booking_date,
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
          u.email as user_email,
          u.phone as user_phone,
          comp.name as company_name
        FROM bookings b
        JOIN trips t ON t.id = b.trip_id
        JOIN routes r ON r.id = t.route_id
        JOIN cities fc ON fc.id = r.from_city_id
        JOIN cities tc ON tc.id = r.to_city_id
        LEFT JOIN users u ON u.id = b.user_id
        LEFT JOIN transport_companies comp ON t.company_id = comp.id
        ORDER BY b.created_at DESC
      `;
      queryParams = [];
    } else {
      // Company users only see their company's bookings
      if (!companyId) {
        return res.status(403).json({ message: "No company associated with this user" });
      }

      query = `
        SELECT 
          b.id,
          b.user_id,
          b.trip_id,
          b.seats_booked,
          b.total_price,
          b.currency,
          b.booking_status,
          b.booking_date,
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
          u.email as user_email,
          u.phone as user_phone
        FROM bookings b
        JOIN trips t ON t.id = b.trip_id
        JOIN routes r ON r.id = t.route_id
        JOIN cities fc ON fc.id = r.from_city_id
        JOIN cities tc ON tc.id = r.to_city_id
        LEFT JOIN users u ON u.id = b.user_id
        WHERE t.company_id = $1
        ORDER BY b.created_at DESC
      `;
      queryParams = [companyId];
    }

    const result = await pool.query(query, queryParams);
    console.log(`Company bookings (admin=${isAdmin}, companyId=${companyId}):`, result.rows.length, 'bookings');
    console.log('Sample booking:', result.rows[0]);
    res.json({ bookings: result.rows });
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

    // Calculate next available seat numbers
    // Get all already assigned seats for this trip (including checked_in bookings)
    const assignedSeatsResult = await pool.query(`
      SELECT assigned_seats FROM bookings 
      WHERE trip_id = $1 
        AND booking_status IN ('confirmed', 'checked_in')
        AND assigned_seats IS NOT NULL
        AND deleted_at IS NULL
    `, [booking.trip_id]);
    
    // Parse all already assigned seats
    const usedSeats: number[] = [];
    for (const row of assignedSeatsResult.rows) {
      if (row.assigned_seats) {
        const seats = row.assigned_seats.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
        usedSeats.push(...seats);
      }
    }
    
    // Find next available seat numbers
    const seatsNeeded = booking.seats_booked;
    const assignedSeats: number[] = [];
    let seatNumber = 1;
    
    while (assignedSeats.length < seatsNeeded) {
      if (!usedSeats.includes(seatNumber)) {
        assignedSeats.push(seatNumber);
      }
      seatNumber++;
      // Safety limit to prevent infinite loop
      if (seatNumber > 1000) break;
    }
    
    const assignedSeatsString = assignedSeats.join(', ');
    console.log(`🪑 Assigning seats ${assignedSeatsString} to booking #${bookingId}`);

    // Update booking status to confirmed with assigned seats
    await pool.query(
      `UPDATE bookings 
       SET booking_status = 'confirmed', 
           qr_code_data = $1,
           assigned_seats = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [qrData, assignedSeatsString, bookingId]
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
        
        console.log(`📱 QR Code generated for booking #${bookingId}, length: ${qrCodeDataUrl?.length || 0} characters`);
        
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
          isGuestBooking: false,
          isConfirmed: true, // Booking is being confirmed
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
            currency: booking.currency,
            assignedSeats: assignedSeatsString
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
      qrCodeData: qrData,
      assignedSeats: assignedSeatsString
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

    // Send rejection email to user/guest
    const bookingDetails = await pool.query(`
      SELECT b.*, u.email as user_email, u.first_name,
             fc.name as from_city, tc.name as to_city,
             t.departure_time,
             comp.name as company_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      JOIN cities fc ON fc.id = r.from_city_id
      JOIN cities tc ON tc.id = r.to_city_id
      JOIN transport_companies comp ON comp.id = t.company_id
      WHERE b.id = $1
    `, [bookingId]);

    const details = bookingDetails.rows[0];
    const recipientEmail = details.user_email || details.guest_email;
    const recipientName = details.user_email ? details.first_name : details.guest_name;

    if (recipientEmail) {
      try {
        const { emailService } = require('../services/email');
        await emailService.sendBookingCancellation({
          recipientEmail,
          recipientName: recipientName || 'Guest',
          bookingId,
          reason,
          tripDetails: {
            from: details.from_city,
            to: details.to_city,
            departureTime: new Date(details.departure_time).toLocaleString('de-DE'),
            company: details.company_name,
            seats: details.seats_booked,
            totalPrice: parseFloat(details.total_price),
            currency: details.currency
          }
        });
        console.log(`✅ Rejection email sent for booking #${bookingId}`);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

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
 * Requires: company_admin, driver, or driver_assistant role
 */
router.post("/verify-qr", requireAuth, requireRole(['company_admin', 'driver', 'driver_assistant']), async (req: AuthedRequest, res) => {
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
        b.trip_id,
        b.seats_booked as quantity,
        b.booking_status as status,
        b.guest_name,
        b.assigned_seats,
        t.departure_time,
        fc.name as from_city,
        tc.name as to_city,
        COALESCE(u.first_name || ' ' || u.last_name, b.guest_name, 'Gast') as passenger_name
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      JOIN cities fc ON fc.id = r.from_city_id
      JOIN cities tc ON tc.id = r.to_city_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.qr_code_data = $1 
        AND t.company_id = $2
        AND b.booking_status IN ('confirmed', 'checked_in')
    `, [qrData, companyId]);

    if (result.rows.length === 0) {
      return res.json({ 
        valid: false,
        message: "Invalid QR code or booking not confirmed"
      });
    }

    const booking = result.rows[0];
    const alreadyCheckedIn = booking.status === 'checked_in';

    // Mark booking as checked-in if not already
    if (!alreadyCheckedIn) {
      await pool.query(
        `UPDATE bookings 
         SET booking_status = 'checked_in',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [booking.id]
      );
    }

    res.json({
      valid: true,
      message: alreadyCheckedIn ? "Buchung bereits eingecheckt" : "Booking verified successfully",
      alreadyCheckedIn,
      booking: {
        id: booking.id,
        tripId: booking.trip_id,
        passengerName: booking.passenger_name || 'Gast',
        seats: booking.quantity || 1,
        assignedSeats: booking.assigned_seats || '-',
        route: `${booking.from_city || ''} → ${booking.to_city || ''}`,
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

/**
 * POST /api/company-bookings/send-passenger-report
 * Send passenger list report to company manager
 * Requires: driver or driver_assistant role
 */
router.post("/send-passenger-report", requireAuth, requireRole(['company_admin', 'driver', 'driver_assistant']), async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { tripId, passengers } = req.body;

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: "Passenger list is required" });
    }

    // Get driver's company and manager email
    const userResult = await pool.query(
      `SELECT u.first_name, u.last_name, u.company_id, tc.name as company_name, tc.email as manager_email
       FROM users u
       LEFT JOIN transport_companies tc ON tc.id = u.company_id
       WHERE u.id = $1`,
      [userId]
    );

    if (!userResult.rows[0]?.company_id) {
      return res.status(403).json({ message: "No company associated with this user" });
    }

    const driverName = `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`;
    const companyName = userResult.rows[0].company_name || 'HopHop';
    const managerEmail = userResult.rows[0].manager_email;

    if (!managerEmail) {
      return res.status(400).json({ message: "No manager email configured for this company" });
    }

    // Get trip details if tripId provided
    let tripInfo = '';
    if (tripId) {
      const tripResult = await pool.query(
        `SELECT t.departure_time, fc.name as from_city, tc.name as to_city
         FROM trips t
         JOIN routes r ON r.id = t.route_id
         JOIN cities fc ON fc.id = r.from_city_id
         JOIN cities tc ON tc.id = r.to_city_id
         WHERE t.id = $1`,
        [tripId]
      );
      if (tripResult.rows[0]) {
        const trip = tripResult.rows[0];
        tripInfo = `${trip.from_city} → ${trip.to_city} (${new Date(trip.departure_time).toLocaleString('de-DE')})`;
      }
    }

    // Generate CSV content
    const csvHeaders = ['Buchungs-Nr', 'Passagier', 'Sitze', 'Sitzplätze', 'Route', 'Abfahrt', 'Eingecheckt'];
    const csvRows = passengers.map((p: any) => [
      p.bookingId,
      p.passengerName,
      p.seats,
      p.assignedSeats,
      p.route,
      new Date(p.departureTime).toLocaleString('de-DE'),
      new Date(p.checkedInAt).toLocaleString('de-DE')
    ]);
    
    const csvContent = [
      csvHeaders.join(';'),
      ...csvRows.map((row: any[]) => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // Calculate total passengers
    const totalPassengers = passengers.reduce((sum: number, p: any) => sum + (p.seats || 1), 0);

    // Send email to manager
    const emailSubject = `🚌 Passagierliste - ${tripInfo || 'Fahrt'} (${totalPassengers} Passagiere)`;
    
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f3f4f6; }
          .summary { background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚌 Passagierliste</h1>
          <p>${tripInfo || 'Aktuelle Fahrt'}</p>
        </div>
        
        <div class="content">
          <p>Gesendet von: <strong>${driverName}</strong></p>
          <p>Unternehmen: <strong>${companyName}</strong></p>
          <p>Datum: ${new Date().toLocaleString('de-DE')}</p>
          
          <div class="summary">
            <h3 style="margin-top: 0;">📊 Zusammenfassung</h3>
            <p>Anzahl Buchungen: <strong>${passengers.length}</strong></p>
            <p>Gesamt Passagiere: <strong>${totalPassengers}</strong></p>
          </div>
          
          <h3>📋 Passagierliste</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Buchung</th>
                <th>Passagier</th>
                <th>Sitze</th>
                <th>Sitzplätze</th>
                <th>Eingecheckt</th>
              </tr>
            </thead>
            <tbody>
              ${passengers.map((p: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>#${p.bookingId}</td>
                  <td>${p.passengerName}</td>
                  <td>${p.seats}</td>
                  <td>${p.assignedSeats}</td>
                  <td>${new Date(p.checkedInAt).toLocaleTimeString('de-DE')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #666; font-size: 12px;">
            Die CSV-Datei ist dieser E-Mail als Anhang beigefügt.
          </p>
        </div>
        
        <div class="footer">
          <p>Diese E-Mail wurde automatisch von HopHop gesendet.</p>
        </div>
      </body>
      </html>
    `;

    // Send email with CSV attachment
    await emailService.sendEmailWithAttachment(
      managerEmail,
      emailSubject,
      emailBody,
      {
        filename: `passagierliste_${new Date().toISOString().split('T')[0]}.csv`,
        content: '\ufeff' + csvContent, // UTF-8 BOM for Excel compatibility
        contentType: 'text/csv'
      }
    );

    console.log(`📧 Passenger report sent to ${managerEmail} by driver ${driverName}`);

    res.json({ 
      success: true,
      message: "Bericht erfolgreich gesendet",
      sentTo: managerEmail,
      passengerCount: totalPassengers
    });
  } catch (error: any) {
    console.error("Error sending passenger report:", error);
    res.status(500).json({ message: "Error sending passenger report", error: String(error) });
  }
});

export default router;
