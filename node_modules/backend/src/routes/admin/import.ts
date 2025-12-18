import { Router } from "express";
import { pool } from "../../db";
import multer from "multer";
import { Readable } from "stream";

const router = Router();

// Configure multer for CSV upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// Helper function to parse CSV
function parseCSV(buffer: Buffer): string[][] {
  const text = buffer.toString("utf-8");
  const lines = text.split("\n").filter((line) => line.trim());
  return lines.map((line) => {
    // Simple CSV parsing (handles quoted fields)
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// POST /api/admin/import/preview - Preview CSV data without importing
router.post("/preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const rows = parseCSV(req.file.buffer);
    const headers = rows[0] || [];
    const dataRows = rows.slice(1, 11); // Preview first 10 data rows

    // Validate structure
    const errors: string[] = [];
    if (headers.length === 0) {
      errors.push("CSV file appears to be empty");
    }

    res.json({
      headers,
      preview: dataRows,
      totalRows: rows.length - 1,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error parsing CSV:", error);
    res.status(500).json({ message: "Error parsing CSV file", error: String(error) });
  }
});

// POST /api/admin/import/trips - Import trips from CSV
router.post("/trips", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const rows = parseCSV(req.file.buffer);
    if (rows.length < 2) {
      return res.status(400).json({ message: "CSV file must have at least a header and one data row" });
    }

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Expected columns (adjust based on your CSV format)
    // Example: route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total
    const requiredColumns = ["route_id", "company_id", "departure_time", "arrival_time", "seats_total"];

    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        requiredColumns,
        foundColumns: headers,
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Import each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (row.length !== headers.length) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: Column count mismatch`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, idx) => {
        rowData[header] = row[idx]?.trim() || null;
      });

      try {
        // Insert trip (adjust based on your schema)
        await pool.query(
          `
          INSERT INTO trips (
            route_id, company_id, transport_type_id,
            departure_station_id, arrival_station_id,
            departure_time, arrival_time, duration_minutes,
            seats_total, seats_available, status, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp, $8, $9, $9, 'scheduled', true)
          `,
          [
            parseInt(rowData.route_id) || null,
            parseInt(rowData.company_id) || null,
            parseInt(rowData.transport_type_id) || 1,
            parseInt(rowData.departure_station_id) || null,
            parseInt(rowData.arrival_station_id) || null,
            rowData.departure_time || null,
            rowData.arrival_time || null,
            parseInt(rowData.duration_minutes) || 0,
            parseInt(rowData.seats_total) || 0,
          ]
        );
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    res.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Error importing CSV:", error);
    res.status(500).json({ message: "Error importing CSV", error: String(error) });
  }
});

export default router;

