import { Router } from "express";
import { pool } from "../../db";
import { AuthedRequest } from "../../middleware/auth";
import PDFDocument from "pdfkit";

const router = Router();

/**
 * GET /api/admin/invoices
 * List all invoices with filters and search
 * Query params:
 *  - booking_id: filter by booking
 *  - user_id: filter by user
 *  - status: filter by invoice status (pending, paid, overdue, cancelled)
 *  - payment_method: filter by payment method
 *  - showDeleted: 'true' to include soft-deleted invoices
 *  - search: search by invoice number, user name/email
 *  - from_date: filter by issue_date >= from_date
 *  - to_date: filter by issue_date <= to_date
 */
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const {
      booking_id,
      user_id,
      status,
      payment_method,
      showDeleted = "false",
      search = "",
      from_date,
      to_date,
    } = req.query as {
      booking_id?: string;
      user_id?: string;
      status?: string;
      payment_method?: string;
      showDeleted?: string;
      search?: string;
      from_date?: string;
      to_date?: string;
    };

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by deleted status
    if (showDeleted === "true") {
      // Show all including deleted
    } else {
      conditions.push(`i.deleted_at IS NULL`);
    }

    // Filter by booking
    if (booking_id) {
      conditions.push(`i.booking_id = $${paramIndex}`);
      params.push(parseInt(booking_id));
      paramIndex++;
    }

    // Filter by user
    if (user_id) {
      conditions.push(`b.user_id = $${paramIndex}`);
      params.push(parseInt(user_id));
      paramIndex++;
    }

    // Filter by status
    if (status) {
      conditions.push(`i.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filter by payment method
    if (payment_method) {
      conditions.push(`i.payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }

    // Filter by date range
    if (from_date) {
      conditions.push(`i.issue_date >= $${paramIndex}`);
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      conditions.push(`i.issue_date <= $${paramIndex}`);
      params.push(to_date);
      paramIndex++;
    }

    // Search by invoice number, user name/email
    if (search.trim()) {
      conditions.push(
        `(i.invoice_number ILIKE $${paramIndex} OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        i.id,
        i.booking_id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.amount,
        i.currency,
        i.status,
        i.payment_method,
        i.payment_date,
        i.created_at,
        i.deleted_at,
        b.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        b.booking_status,
        b.seats_booked,
        t.company_id,
        tc.name AS company_name
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      ${whereClause}
      ORDER BY i.issue_date DESC
    `;

    const result = await pool.query(query, params);

    // Convert numeric fields from string to number
    const invoices = result.rows.map((invoice) => ({
      ...invoice,
      amount: parseFloat(invoice.amount),
    }));

    res.json({
      invoices,
      total: invoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/admin/invoices/:id
 * Get single invoice details
 */
router.get("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        i.id,
        i.booking_id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.amount,
        i.currency,
        i.status,
        i.payment_method,
        i.payment_date,
        i.created_at,
        i.deleted_at,
        b.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        b.booking_status,
        b.seats_booked,
        b.total_price AS booking_total,
        t.company_id,
        tc.name AS company_name
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      WHERE i.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
      booking_total: result.rows[0].booking_total
        ? parseFloat(result.rows[0].booking_total)
        : null,
    };

    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/admin/invoices/:id
 * Update invoice details
 * Body: { status?, payment_method?, payment_date?, amount?, due_date? }
 */
router.patch("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, payment_date, amount, due_date } =
      req.body;

    // Check if invoice exists and is not deleted
    const checkQuery = `
      SELECT id, deleted_at FROM invoices WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (checkResult.rows[0].deleted_at) {
      return res
        .status(400)
        .json({ message: "Cannot update deleted invoice" });
    }

    // Validate status
    const validStatuses = ["pending", "paid", "overdue", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate amount
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ message: "Amount cannot be negative" });
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (payment_method !== undefined) {
      updates.push(`payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }

    if (payment_date !== undefined) {
      updates.push(`payment_date = $${paramIndex}`);
      params.push(payment_date);
      paramIndex++;
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex}`);
      params.push(amount);
      paramIndex++;
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(due_date);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);

    const updateQuery = `
      UPDATE invoices
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
    };

    res.json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/admin/invoices/:id
 * Soft delete or permanently delete an invoice
 * Query params:
 *  - permanent: 'true' for hard delete, otherwise soft delete
 */
router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { permanent = "false" } = req.query as { permanent?: string };

    if (permanent === "true") {
      // Permanent delete
      const deleteQuery = `
        DELETE FROM invoices WHERE id = $1 RETURNING id
      `;
      const result = await pool.query(deleteQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json({
        message: "Invoice permanently deleted",
        id: result.rows[0].id,
      });
    } else {
      // Soft delete
      const updateQuery = `
        UPDATE invoices
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `;
      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Invoice not found or already deleted" });
      }

      res.json({
        message: "Invoice soft deleted successfully",
        id: result.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/admin/invoices/:id/restore
 * Restore a soft-deleted invoice
 */
router.post("/:id/restore", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const updateQuery = `
      UPDATE invoices
      SET deleted_at = NULL
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Invoice not found or not deleted" });
    }

    const invoice = {
      ...result.rows[0],
      amount: parseFloat(result.rows[0].amount),
    };

    res.json({
      message: "Invoice restored successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error restoring invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/admin/invoices/:id/pdf
 * Generate and download invoice as PDF
 */
router.get("/:id/pdf", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { lang = "en" } = req.query as { lang?: string };

    // Fetch invoice with all related data
    const query = `
      SELECT 
        i.id,
        i.booking_id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.amount,
        i.currency,
        i.status,
        i.payment_method,
        i.payment_date,
        i.created_at,
        b.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        b.booking_status,
        b.seats_booked,
        b.total_price AS booking_total,
        t.company_id,
        tc.name AS company_name,
        tc.email AS company_email,
        tc.phone AS company_phone,
        t.departure_time::date AS departure_date,
        to_char(t.departure_time, 'HH24:MI') AS departure_time_str,
        to_char(t.arrival_time, 'HH24:MI') AS arrival_time_str,
        dep_city.name AS departure_city,
        arr_city.name AS arrival_city,
        dep_station.name AS departure_station,
        arr_station.name AS arrival_station
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN transport_companies tc ON t.company_id = tc.id
      LEFT JOIN stations dep_station ON t.departure_station_id = dep_station.id
      LEFT JOIN stations arr_station ON t.arrival_station_id = arr_station.id
      LEFT JOIN cities dep_city ON dep_station.city_id = dep_city.id
      LEFT JOIN cities arr_city ON arr_station.city_id = arr_city.id
      WHERE i.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = result.rows[0];

    // Translations
    const translations: Record<string, Record<string, string>> = {
      en: {
        invoice: "INVOICE",
        invoiceNumber: "Invoice Number",
        issueDate: "Issue Date",
        dueDate: "Due Date",
        status: "Status",
        paymentMethod: "Payment Method",
        paymentDate: "Payment Date",
        billTo: "Bill To",
        from: "From",
        tripDetails: "Trip Details",
        departure: "Departure",
        arrival: "Arrival",
        date: "Date",
        time: "Time",
        station: "Station",
        seats: "Seats",
        subtotal: "Subtotal",
        total: "TOTAL",
        pending: "Pending",
        paid: "Paid",
        overdue: "Overdue",
        cancelled: "Cancelled",
        cash: "Cash",
        card: "Card",
        bank: "Bank Transfer",
        online: "Online",
        thankYou: "Thank you for your business!",
        generatedOn: "Generated on",
      },
      de: {
        invoice: "RECHNUNG",
        invoiceNumber: "Rechnungsnummer",
        issueDate: "Ausstellungsdatum",
        dueDate: "Fälligkeitsdatum",
        status: "Status",
        paymentMethod: "Zahlungsmethode",
        paymentDate: "Zahlungsdatum",
        billTo: "Rechnungsempfänger",
        from: "Von",
        tripDetails: "Reisedetails",
        departure: "Abfahrt",
        arrival: "Ankunft",
        date: "Datum",
        time: "Zeit",
        station: "Station",
        seats: "Sitzplätze",
        subtotal: "Zwischensumme",
        total: "GESAMT",
        pending: "Ausstehend",
        paid: "Bezahlt",
        overdue: "Überfällig",
        cancelled: "Storniert",
        cash: "Bargeld",
        card: "Karte",
        bank: "Banküberweisung",
        online: "Online",
        thankYou: "Vielen Dank für Ihren Auftrag!",
        generatedOn: "Erstellt am",
      },
      ar: {
        invoice: "فاتورة",
        invoiceNumber: "رقم الفاتورة",
        issueDate: "تاريخ الإصدار",
        dueDate: "تاريخ الاستحقاق",
        status: "الحالة",
        paymentMethod: "طريقة الدفع",
        paymentDate: "تاريخ الدفع",
        billTo: "فاتورة إلى",
        from: "من",
        tripDetails: "تفاصيل الرحلة",
        departure: "المغادرة",
        arrival: "الوصول",
        date: "التاريخ",
        time: "الوقت",
        station: "المحطة",
        seats: "المقاعد",
        subtotal: "المجموع الفرعي",
        total: "الإجمالي",
        pending: "قيد الانتظار",
        paid: "مدفوع",
        overdue: "متأخر",
        cancelled: "ملغي",
        cash: "نقدي",
        card: "بطاقة",
        bank: "تحويل بنكي",
        online: "عبر الإنترنت",
        thankYou: "شكراً لتعاملكم معنا!",
        generatedOn: "تم الإنشاء في",
      },
    };

    const t = translations[lang] || translations.en;

    // Create PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoice_number}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Helper functions
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString(
        lang === "ar" ? "ar-EG" : lang === "de" ? "de-DE" : "en-US"
      );
    };

    const getStatusText = (status: string) => {
      return t[status] || status;
    };

    const getPaymentMethodText = (method: string | null) => {
      if (!method) return "-";
      return t[method] || method;
    };

    // Colors
    const primaryColor = "#16a34a"; // Green
    const textColor = "#1f2937";
    const lightGray = "#6b7280";

    // Header with HopHop branding
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .text("HopHop", 50, 50, { continued: true })
      .fontSize(12)
      .fillColor(lightGray)
      .text("  Travel Booking", { continued: false });

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor(lightGray)
      .text("https://hophopsy.com", 50, doc.y);

    // Invoice title
    doc.moveDown(2);
    doc.fontSize(24).fillColor(textColor).text(t.invoice, { align: "center" });

    // Invoice details box
    doc.moveDown(1);
    const detailsY = doc.y;

    // Left column - Invoice info
    doc.fontSize(10).fillColor(lightGray);
    doc.text(`${t.invoiceNumber}:`, 50, detailsY);
    doc.fontSize(10).fillColor(textColor);
    doc.text(invoice.invoice_number, 180, detailsY);

    doc.fontSize(10).fillColor(lightGray);
    doc.text(`${t.issueDate}:`, 50, detailsY + 18);
    doc.fillColor(textColor);
    doc.text(formatDate(invoice.issue_date), 180, detailsY + 18);

    doc.fillColor(lightGray);
    doc.text(`${t.dueDate}:`, 50, detailsY + 36);
    doc.fillColor(textColor);
    doc.text(formatDate(invoice.due_date), 180, detailsY + 36);

    doc.fillColor(lightGray);
    doc.text(`${t.status}:`, 50, detailsY + 54);
    doc.fillColor(
      invoice.status === "paid"
        ? "#16a34a"
        : invoice.status === "overdue"
        ? "#dc2626"
        : "#ca8a04"
    );
    doc.text(getStatusText(invoice.status), 180, detailsY + 54);

    // Right column - Payment info
    doc.fillColor(lightGray);
    doc.text(`${t.paymentMethod}:`, 350, detailsY);
    doc.fillColor(textColor);
    doc.text(getPaymentMethodText(invoice.payment_method), 480, detailsY);

    if (invoice.payment_date) {
      doc.fillColor(lightGray);
      doc.text(`${t.paymentDate}:`, 350, detailsY + 18);
      doc.fillColor(textColor);
      doc.text(formatDate(invoice.payment_date), 480, detailsY + 18);
    }

    // Divider
    doc.moveDown(4);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();

    // Bill To section
    doc.moveDown(1);
    const billToY = doc.y;

    doc.fontSize(12).fillColor(primaryColor).text(t.billTo, 50, billToY);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(textColor).text(invoice.user_name || "-");
    doc.fillColor(lightGray).text(invoice.user_email || "-");
    if (invoice.user_phone) {
      doc.text(invoice.user_phone);
    }

    // Company section (From)
    doc.fontSize(12).fillColor(primaryColor).text(t.from, 350, billToY);
    doc.y = billToY + 18;
    doc.fontSize(10).fillColor(textColor).text(invoice.company_name || "-", 350);
    if (invoice.company_email) {
      doc.fillColor(lightGray).text(invoice.company_email, 350);
    }
    if (invoice.company_phone) {
      doc.text(invoice.company_phone, 350);
    }

    // Divider
    doc.moveDown(2);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();

    // Trip Details section
    doc.moveDown(1);
    doc.fontSize(14).fillColor(primaryColor).text(t.tripDetails);
    doc.moveDown(0.5);

    // Trip details table
    const tripTableY = doc.y;

    // Headers
    doc.fontSize(9).fillColor(lightGray);
    doc.text("", 50, tripTableY);
    doc.text(t.departure, 120, tripTableY);
    doc.text(t.arrival, 320, tripTableY);

    // Route
    doc.moveDown(0.8);
    doc.fontSize(10).fillColor(textColor);
    doc.text(invoice.departure_city || "-", 120, doc.y);
    doc.text(invoice.arrival_city || "-", 320, doc.y - 12);

    // Stations
    doc.moveDown(0.8);
    doc.fontSize(9).fillColor(lightGray);
    doc.text(`${t.station}:`, 50, doc.y);
    doc.fillColor(textColor);
    doc.text(invoice.departure_station || "-", 120, doc.y - 10);
    doc.text(invoice.arrival_station || "-", 320, doc.y - 10);

    // Date and Time
    doc.moveDown(0.8);
    doc.fillColor(lightGray);
    doc.text(`${t.date}:`, 50, doc.y);
    doc.fillColor(textColor);
    doc.text(formatDate(invoice.departure_date), 120, doc.y - 10);

    doc.moveDown(0.8);
    doc.fillColor(lightGray);
    doc.text(`${t.time}:`, 50, doc.y);
    doc.fillColor(textColor);
    doc.text(invoice.departure_time_str || "-", 120, doc.y - 10);
    doc.text(invoice.arrival_time_str || "-", 320, doc.y - 10);

    // Seats
    doc.moveDown(0.8);
    doc.fillColor(lightGray);
    doc.text(`${t.seats}:`, 50, doc.y);
    doc.fillColor(textColor);
    doc.text(String(invoice.seats_booked || 1), 120, doc.y - 10);

    // Divider
    doc.moveDown(2);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();

    // Total section
    doc.moveDown(1);
    const totalY = doc.y;

    // Total amount box
    doc.rect(350, totalY, 195, 50).fillColor("#f0fdf4").fill();
    doc.strokeColor(primaryColor).lineWidth(2).rect(350, totalY, 195, 50).stroke();

    doc.fontSize(12).fillColor(lightGray);
    doc.text(t.total, 370, totalY + 10);

    doc.fontSize(20).fillColor(primaryColor);
    doc.text(
      `${parseFloat(invoice.amount).toFixed(2)} ${invoice.currency}`,
      370,
      totalY + 26
    );

    // Footer
    const footerY = 750;

    // Thank you message
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text(t.thankYou, 50, footerY, { align: "center" });

    // Generated timestamp
    doc
      .fontSize(8)
      .fillColor(lightGray)
      .text(
        `${t.generatedOn}: ${new Date().toLocaleString(
          lang === "ar" ? "ar-EG" : lang === "de" ? "de-DE" : "en-US"
        )}`,
        50,
        footerY + 20,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

export default router;
