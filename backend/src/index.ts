import express, { Request, Response } from "express";
import cors from "cors";
import { pool } from "./db";
import authRoutes from "./routes/auth";
import { requireAuth } from "./middleware/auth";
import bookingsRoutes from "./routes/bookings";


const app = express();
const PORT = process.env.PORT || 4000;

// ====== Middlewares ======
app.use(cors());
app.use(express.json());

// ✅ Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingsRoutes);


// ====== Test Route ======
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running ✅");
});

// ====== GET /api/trips - البحث عن الرحلات ======
app.get("/api/trips", async (req, res) => {
  try {
    const { from, to } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];

    if (from) {
      conditions.push(`LOWER(c_from.name) LIKE LOWER($${values.length + 1})`);
      values.push(`%${from}%`);
    }

    if (to) {
      conditions.push(`LOWER(c_to.name) LIKE LOWER($${values.length + 1})`);
      values.push(`%${to}%`);
    }

    let query = `
      SELECT
        t.id,
        t.departure_time,
        t.arrival_time,
        t.duration_minutes,
        t.seats_total,
        t.seats_available,
        t.status,
        c_from.name AS from_city,
        c_to.name   AS to_city,
        s_from.name AS departure_station,
        s_to.name   AS arrival_station,
        MIN(tf.price)    AS price,
        MIN(tf.currency) AS currency
      FROM trips t
      JOIN routes r         ON t.route_id = r.id
      JOIN cities c_from    ON r.from_city_id = c_from.id
      JOIN cities c_to      ON r.to_city_id   = c_to.id
      JOIN stations s_from  ON t.departure_station_id = s_from.id
      JOIN stations s_to    ON t.arrival_station_id   = s_to.id
      LEFT JOIN trip_fares tf ON tf.trip_id = t.id
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")} `;
    }

    query += `
      GROUP BY
        t.id, c_from.name, c_to.name, s_from.name, s_to.name
      ORDER BY t.id
      LIMIT 100
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Error fetching trips", error: String(error) });
  }
});



app.get("/api/health/db", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    console.error("DB health error:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ ok: true, message: "You are authenticated 🎉" });
});
// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
