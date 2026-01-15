import { Router } from "express";
import { pool } from "../../db";
import { AuthedRequest } from "../../middleware/auth";
import puppeteer from "puppeteer";

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
    const isRTL = lang === "ar";

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

    const statusColor = 
      invoice.status === "paid" ? "#16a34a" :
      invoice.status === "overdue" ? "#dc2626" : "#ca8a04";

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Inter:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${isRTL ? "'Noto Sans Arabic', 'Inter', sans-serif" : "'Inter', 'Noto Sans Arabic', sans-serif"};
      font-size: 10px;
      color: #1f2937;
      padding: 25px;
      direction: ${isRTL ? 'rtl' : 'ltr'};
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 12px;
    }
    
    .logo {
      font-size: 22px;
      font-weight: 700;
      color: #16a34a;
    }
    
    .logo span {
      font-size: 10px;
      color: #6b7280;
      font-weight: 400;
    }
    
    .website {
      font-size: 9px;
      color: #6b7280;
      margin-top: 3px;
    }
    
    .invoice-title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
      margin: 12px 0;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .detail-section {
      background: #f9fafb;
      padding: 10px;
      border-radius: 6px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 9px;
    }
    
    .detail-label {
      color: #6b7280;
      font-weight: 500;
    }
    
    .detail-value {
      color: #1f2937;
      font-weight: 600;
    }
    
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 600;
      color: white;
      background-color: ${statusColor};
    }
    
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .party-section h3 {
      color: #16a34a;
      font-size: 11px;
      margin-bottom: 6px;
      font-weight: 700;
    }
    
    .party-section p {
      margin-bottom: 2px;
      color: #374151;
      font-size: 9px;
    }
    
    .party-section .email {
      color: #6b7280;
    }
    
    .trip-section {
      background: #f0fdf4;
      border: 1px solid #16a34a;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 15px;
    }
    
    .trip-section h3 {
      color: #16a34a;
      font-size: 12px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .trip-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .trip-column h4 {
      color: #6b7280;
      font-size: 9px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .trip-column .city {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }
    
    .trip-column .station {
      font-size: 9px;
      color: #6b7280;
      margin-top: 2px;
    }
    
    .trip-column .time {
      font-size: 12px;
      font-weight: 600;
      color: #16a34a;
      margin-top: 5px;
    }
    
    .trip-info {
      display: flex;
      gap: 20px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #bbf7d0;
      font-size: 9px;
    }
    
    .trip-info-item {
      display: flex;
      gap: 5px;
    }
    
    .trip-info-label {
      color: #6b7280;
    }
    
    .trip-info-value {
      font-weight: 600;
    }
    
    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    
    .total-box {
      background: #f0fdf4;
      border: 2px solid #16a34a;
      border-radius: 6px;
      padding: 12px 30px;
      text-align: center;
    }
    
    .total-label {
      color: #6b7280;
      font-size: 10px;
      margin-bottom: 3px;
    }
    
    .total-amount {
      color: #16a34a;
      font-size: 20px;
      font-weight: 700;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    
    .thank-you {
      color: #16a34a;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .generated {
      color: #9ca3af;
      font-size: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HopHop <span>Travel Booking</span></div>
    <div class="website">https://hophopsy.com</div>
  </div>
  
  <div class="invoice-title">${t.invoice}</div>
  
  <div class="details-grid">
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">${t.invoiceNumber}:</span>
        <span class="detail-value">${invoice.invoice_number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${t.issueDate}:</span>
        <span class="detail-value">${formatDate(invoice.issue_date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${t.dueDate}:</span>
        <span class="detail-value">${formatDate(invoice.due_date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${t.status}:</span>
        <span class="status-badge">${getStatusText(invoice.status)}</span>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">${t.paymentMethod}:</span>
        <span class="detail-value">${getPaymentMethodText(invoice.payment_method)}</span>
      </div>
      ${invoice.payment_date ? `
      <div class="detail-row">
        <span class="detail-label">${t.paymentDate}:</span>
        <span class="detail-value">${formatDate(invoice.payment_date)}</span>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="parties-grid">
    <div class="party-section">
      <h3>${t.billTo}</h3>
      <p><strong>${invoice.user_name || '-'}</strong></p>
      <p class="email">${invoice.user_email || '-'}</p>
      ${invoice.user_phone ? `<p>${invoice.user_phone}</p>` : ''}
    </div>
    <div class="party-section">
      <h3>${t.from}</h3>
      <p><strong>${invoice.company_name || 'HopHop Transport'}</strong></p>
      <p class="email">${invoice.company_email || 'info@hophopsy.com'}</p>
      ${invoice.company_phone ? `<p>${invoice.company_phone}</p>` : ''}
    </div>
  </div>
  
  <div class="trip-section">
    <h3>${t.tripDetails}</h3>
    <div class="trip-grid">
      <div class="trip-column">
        <h4>${t.departure}</h4>
        <div class="city">${invoice.departure_city || '-'}</div>
        <div class="station">${invoice.departure_station || '-'}</div>
        <div class="time">${invoice.departure_time_str || '-'}</div>
      </div>
      <div class="trip-column">
        <h4>${t.arrival}</h4>
        <div class="city">${invoice.arrival_city || '-'}</div>
        <div class="station">${invoice.arrival_station || '-'}</div>
        <div class="time">${invoice.arrival_time_str || '-'}</div>
      </div>
    </div>
    <div class="trip-info">
      <div class="trip-info-item">
        <span class="trip-info-label">${t.date}:</span>
        <span class="trip-info-value">${formatDate(invoice.departure_date)}</span>
      </div>
      <div class="trip-info-item">
        <span class="trip-info-label">${t.seats}:</span>
        <span class="trip-info-value">${invoice.seats_booked || 1}</span>
      </div>
    </div>
  </div>
  
  <div class="total-section">
    <div class="total-box">
      <div class="total-label">${t.total}</div>
      <div class="total-amount">${parseFloat(invoice.amount).toFixed(2)} ${invoice.currency}</div>
    </div>
  </div>
  
  <div class="footer">
    <div class="thank-you">${t.thankYou}</div>
    <div class="generated">${t.generatedOn}: ${new Date().toLocaleString(
      lang === "ar" ? "ar-EG" : lang === "de" ? "de-DE" : "en-US"
    )}</div>
  </div>
</body>
</html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoice_number}.pdf"`
    );
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

export default router;
