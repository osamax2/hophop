import express, { Request, Response } from "express";
import cors from "cors";
import { pool } from "./db";

const app = express();
const PORT = process.env.PORT || 4000;

// ====== Middlewares ======
app.use(cors());
app.use(express.json());

// ====== Test Route ======
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running ✅");
});

// ====== GET /api/trips - البحث عن الرحلات ======
app.get("/api/trips", async (req: Request, res: Response) => {
  const { from, to, date } = req.query;

  try {
    const conditions: string[] = [];
    const values: any[] = [];

    // الكويري الأساسي (حسب الـ ER Diagram: trips + routes + cities + stations)
    let query = `
      SELECT
        t.id,
        t.departure_date,
        t.departure_time,
        t.arrival_date,
        t.arrival_time,
        t.seats_available,
        t.base_fare,
        r.id AS route_id,
        c_from.name AS from_city,
        c_to.name   AS to_city,
        s_from.name AS departure_station,
        s_to.name   AS arrival_station
      FROM trips t
      JOIN routes r         ON t.route_id = r.id
      JOIN cities c_from    ON r.from_city_id = c_from.id
      JOIN cities c_to      ON r.to_city_id   = c_to.id
      JOIN stations s_from  ON t.departure_station_id = s_from.id
      JOIN stations s_to    ON t.arrival_station_id   = s_to.id
    `;

    // فلترة حسب باراميترات البحث (اختياريين)
    if (from) {
      conditions.push(`LOWER(c_from.name) LIKE LOWER($${values.length + 1})`);
      values.push(`%${from}%`);
    }

    if (to) {
      conditions.push(`LOWER(c_to.name) LIKE LOWER($${values.length + 1})`);
      values.push(`%${to}%`);
    }

    if (date) {
      conditions.push(`t.departure_date = $${values.length + 1}`);
      values.push(date);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY t.departure_date, t.departure_time";

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Error fetching trips" });
  }
});

// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
