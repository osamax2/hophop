import express, { Request, Response } from "express";
import cors from "cors";
import { pool } from "./db";
import authRoutes from "./routes/auth";
import { requireAuth, AuthedRequest } from "./middleware/auth";
import bookingsRoutes from "./routes/bookings";
import bookingStatusRoutes from "./routes/booking-status";
import companyBookingsRoutes from "./routes/company-bookings";
import favoritesRoutes from "./routes/favorites";
import ratingsRoutes from "./routes/ratings";
import imagesRoutes from "./routes/images";
import notificationsRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";
// CRUD Routes
import usersRoutes from "./routes/users";
import bookingsCrudRoutes from "./routes/bookings-crud";
import tripsCrudRoutes from "./routes/trips-crud";
import citiesRoutes from "./routes/cities";
import companiesRoutes from "./routes/companies";

const app = express();
const PORT = process.env.PORT || 4000;

// ====== Middlewares ======
app.use(cors());
app.use(express.json());
// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/booking-status", bookingStatusRoutes);
app.use("/api/company-bookings", companyBookingsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/companies", companiesRoutes);

// ✅ CRUD Routes
app.use("/api/users", usersRoutes);
app.use("/api/bookings-crud", bookingsCrudRoutes);
app.use("/api/trips-crud", tripsCrudRoutes);
app.use("/api/cities", citiesRoutes);


// ====== Test Route ======
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running ✅");
});

// City name mapping for Arabic/English support
const cityNameMapping: { [key: string]: string[] } = {
  'دمشق': ['Damascus', 'دمشق'],
  'حلب': ['Aleppo', 'حلب'],
  'حمص': ['Homs', 'حمص'],
  'اللاذقية': ['Latakia', 'اللاذقية', 'Lattakia'],
  'طرطوس': ['Tartus', 'طرطوس', 'Tartous'],
  'دير الزور': ['Deir ez-Zor', 'دير الزور', 'Deir Ezzor'],
  'الحسكة': ['Al-Hasakah', 'الحسكة', 'Hasakah'],
  'الرقة': ['Ar-Raqqah', 'الرقة', 'Raqqa'],
  'السويداء': ['As-Suwayda', 'السويداء', 'Suwayda'],
  'درعا': ['Daraa', 'درعا', 'Dara'],
  'إدلب': ['Idlib', 'إدلب'],
  'حماة': ['Hama', 'حماة'],
  'القنيطرة': ['Quneitra', 'القنيطرة'],
  'دوما': ['Douma', 'دوما'],
};

// Helper function to get city name variations
function getCityNameVariations(searchTerm: string): string[] {
  const normalized = searchTerm.trim().toLowerCase();
  const variations: string[] = [normalized];
  
  // Check if search term is in mapping
  for (const [key, values] of Object.entries(cityNameMapping)) {
    if (key.toLowerCase() === normalized || values.some(v => v.toLowerCase() === normalized)) {
      variations.push(...values.map(v => v.toLowerCase()));
      variations.push(key.toLowerCase());
      break;
    }
  }
  
  // Remove duplicates and return
  return [...new Set(variations)];
}

// ====== GET /api/trips - البحث عن الرحلات ======
app.get("/api/trips", async (req, res) => {
  try {
    const { from, to, date } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];

    // Always filter for active trips only
    conditions.push(`t.is_active = true`);

    if (from && typeof from === 'string' && from.trim() !== '') {
      // Get city name variations (Arabic/English)
      const fromVariations = getCityNameVariations(from);
      const fromConditions: string[] = [];
      
      fromVariations.forEach((variation, index) => {
        fromConditions.push(`LOWER(c_from.name) LIKE LOWER($${values.length + 1})`);
        values.push(`${variation}%`);
      });
      
      if (fromConditions.length > 0) {
        conditions.push(`(${fromConditions.join(' OR ')})`);
      }
    }

    if (to && typeof to === 'string' && to.trim() !== '') {
      // Get city name variations (Arabic/English)
      const toVariations = getCityNameVariations(to);
      const toConditions: string[] = [];
      
      toVariations.forEach((variation) => {
        toConditions.push(`LOWER(c_to.name) LIKE LOWER($${values.length + 1})`);
        values.push(`${variation}%`);
      });
      
      if (toConditions.length > 0) {
        conditions.push(`(${toConditions.join(' OR ')})`);
      }
    }

    if (date && typeof date === 'string' && date.trim() !== '') {
      // Calculate date range: -2 days to +2 days (5 days total)
      const dateStr = date.trim();
      const searchDate = new Date(dateStr);
      
      // Validate date
      if (isNaN(searchDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format", error: `Date '${dateStr}' is not a valid date` });
      }
      
      const startDate = new Date(searchDate);
      startDate.setDate(startDate.getDate() - 2);
      const endDate = new Date(searchDate);
      endDate.setDate(endDate.getDate() + 2);
      
      conditions.push(`DATE(t.departure_time) >= $${values.length + 1}::date AND DATE(t.departure_time) <= $${values.length + 2}::date`);
      values.push(startDate.toISOString().split('T')[0]);
      values.push(endDate.toISOString().split('T')[0]);
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
        t.equipment,
        c_from.name AS from_city,
        c_to.name   AS to_city,
        s_from.name AS departure_station,
        s_to.name   AS arrival_station,
        COALESCE(comp.name, 'Unknown') AS company_name,
        COALESCE(tt.label, tt.code, 'normal') AS transport_type,
        MIN(tf.price)    AS price,
        MIN(tf.currency) AS currency,
        COALESCE((
          SELECT COUNT(*)::int
          FROM route_stops rs
          WHERE rs.route_id = t.route_id
        ), 0) AS stops_count
      FROM trips t
      JOIN routes r         ON t.route_id = r.id
      JOIN cities c_from    ON r.from_city_id = c_from.id
      JOIN cities c_to      ON r.to_city_id   = c_to.id
      JOIN stations s_from  ON t.departure_station_id = s_from.id
      JOIN stations s_to    ON t.arrival_station_id   = s_to.id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      LEFT JOIN trip_fares tf ON tf.trip_id = t.id
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")} `;
    }

    query += `
      GROUP BY
        t.id, c_from.name, c_to.name, s_from.name, s_to.name,
        comp.name, tt.label, tt.code, t.equipment, t.route_id
      ORDER BY t.id
      LIMIT 100
    `;

    console.log("Executing query:", query);
    console.log("With values:", values);
    
    const result = await pool.query(query, values);
    
    console.log(`Found ${result.rows.length} trips`);
    
    // Transform to match frontend Trip type
    const transformedTrips = result.rows.map((row: any) => {
      // Format time as HH:mm (24-hour format)
      const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      // Format duration
      const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
          return `${hours}h ${mins}m`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else {
          return `${mins}m`;
        }
      };

      // Parse amenities from equipment field
      const amenities: string[] = [];
      if (row.equipment) {
        const equipment = row.equipment.toLowerCase();
        if (equipment.includes('wifi')) amenities.push('wifi');
        if (equipment.includes('ac') || equipment.includes('air')) amenities.push('ac');
        if (equipment.includes('usb')) amenities.push('usb');
        if (equipment.includes('tv') || equipment.includes('screen')) amenities.push('tv');
      }

      // Map transport type to frontend type
      let tripType: 'vip' | 'normal' | 'van' = 'normal';
      if (row.transport_type) {
        const type = row.transport_type.toLowerCase();
        if (type.includes('vip')) tripType = 'vip';
        else if (type.includes('van')) tripType = 'van';
      }

      return {
        id: String(row.id),
        from: row.from_city,
        to: row.to_city,
        departureTime: formatTime(row.departure_time),
        arrivalTime: formatTime(row.arrival_time),
        duration: formatDuration(row.duration_minutes || 0),
        price: parseFloat(row.price) || 0,
        company: row.company_name || 'Unknown',
        type: tripType,
        amenities: amenities,
        stops: row.stops_count || 0,
        seatsAvailable: row.seats_available || 0,
      };
    });

    res.json(transformedTrips);
  } catch (error: any) {
    console.error("Error fetching trips:", error);
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || '';
    const errorCode = error?.code;
    const errorQuery = error?.query;
    
    console.error("Error details:", { 
      errorMessage, 
      errorStack, 
      errorCode,
      errorQuery: errorQuery ? { text: errorQuery.text, values: errorQuery.values } : undefined
    });
    
    res.status(500).json({ 
      message: "Error fetching trips", 
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        stack: errorStack,
        query: errorQuery
      } : undefined
    });
  }
});

// ====== GET /api/trips/:id - Get trip details ======
app.get("/api/trips/:id", async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.route_id,
        t.departure_time,
        t.arrival_time,
        t.duration_minutes,
        t.seats_total,
        t.seats_available,
        t.status,
        t.equipment,
        t.cancellation_policy,
        t.extra_info,
        c_from.name AS from_city,
        c_to.name   AS to_city,
        s_from.name AS departure_station,
        s_from.id AS departure_station_id,
        s_to.name   AS arrival_station,
        s_to.id AS arrival_station_id,
        co.name AS company_name,
        co.id AS company_id,
        tt.label AS transport_type,
        tt.id AS transport_type_id,
        MIN(tf.price) AS price,
        MIN(tf.currency) AS currency
      FROM trips t
      JOIN routes r         ON t.route_id = r.id
      JOIN cities c_from    ON r.from_city_id = c_from.id
      JOIN cities c_to      ON r.to_city_id   = c_to.id
      LEFT JOIN stations s_from  ON t.departure_station_id = s_from.id
      LEFT JOIN stations s_to    ON t.arrival_station_id   = s_to.id
      LEFT JOIN transport_companies co ON t.company_id = co.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      LEFT JOIN trip_fares tf ON tf.trip_id = t.id
      WHERE t.id = $1
      GROUP BY
        t.id, t.route_id, c_from.name, c_to.name, s_from.name, s_from.id, s_to.name, s_to.id,
        co.name, co.id, tt.label, tt.id
      `,
      [tripId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = result.rows[0];

    // Get intermediate stops if any (assuming route_stops table exists)
    // For now, we'll return empty array if table doesn't exist
    let stops: any[] = [];
    try {
      const stopsResult = await pool.query(
        `
        SELECT
          rs.stop_order,
          s.name AS station_name,
          rs.arrival_time,
          rs.departure_time
        FROM route_stops rs
        JOIN stations s ON rs.station_id = s.id
        WHERE rs.route_id = (
          SELECT route_id FROM trips WHERE id = $1
        )
        ORDER BY rs.stop_order
        `,
        [tripId]
      );
      stops = stopsResult.rows;
    } catch (e) {
      // route_stops table might not exist, that's okay
      console.log("Route stops not available:", e);
    }

    // Get images for this trip
    let images: any[] = [];
    try {
      const imagesResult = await pool.query(
        `
        SELECT id, image_url, file_name, entity_type
        FROM images
        WHERE entity_type = 'trip' AND entity_id = $1 AND is_active = true
        ORDER BY created_at DESC
        `,
        [tripId]
      );
      images = imagesResult.rows;
    } catch (e) {
      console.log("Images not available:", e);
    }

    // Get bus images (if company has bus images)
    let busImages: any[] = [];
    try {
      const busImagesResult = await pool.query(
        `
        SELECT id, image_url, file_name
        FROM images
        WHERE entity_type = 'bus' AND entity_id = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 5
        `,
        [trip.company_id]
      );
      busImages = busImagesResult.rows;
    } catch (e) {
      console.log("Bus images not available:", e);
    }

    // Get station images
    let stationImages: any[] = [];
    try {
      const stationImagesResult = await pool.query(
        `
        SELECT id, image_url, file_name, entity_id
        FROM images
        WHERE entity_type = 'station' 
        AND entity_id IN ($1, $2) 
        AND is_active = true
        ORDER BY created_at DESC
        `,
        [trip.departure_station_id, trip.arrival_station_id]
      );
      stationImages = stationImagesResult.rows;
    } catch (e) {
      console.log("Station images not available:", e);
    }

    res.json({
      ...trip,
      stops,
      images,
      busImages,
      stationImages,
    });
  } catch (error: any) {
    console.error("Error fetching trip details:", error);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    res.status(500).json({ 
      message: "Error fetching trip details", 
      error: error.message || String(error),
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ====== GET /api/trips/:id/images - Get images for a trip ======
app.get("/api/trips/:id/images", async (req, res) => {
  try {
    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const result = await pool.query(
      `
      SELECT id, image_url, file_name, entity_type, created_at
      FROM images
      WHERE entity_type = 'trip' AND entity_id = $1 AND is_active = true
      ORDER BY created_at DESC
      `,
      [tripId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trip images:", error);
    res.status(500).json({ message: "Error fetching trip images", error: String(error) });
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
// ====== GET /api/users/me - Get current user profile ======
app.get("/api/users/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.gender,
        u.address,
        u.is_active,
        COALESCE(
          array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL),
          '{}'
        ) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile", error: String(error) });
  }
});

// ====== PATCH /api/users/me - Update current user profile ======
app.patch("/api/users/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      phone,
      gender,
      address,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${idx++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${idx++}`);
      values.push(lastName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (gender !== undefined) {
      updates.push(`gender = $${idx++}`);
      values.push(gender);
    }
    if (address !== undefined) {
      updates.push(`address = $${idx++}`);
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(userId);
    const query = `
      UPDATE users
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, email, first_name, last_name, phone, gender, address
    `;

    const result = await pool.query(query, values);
    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating user profile", error: String(error) });
  }
});

// Legacy endpoint for backward compatibility
app.get("/api/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        COALESCE(
          array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL),
          '{}'
        ) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    // Map role names to frontend role format
    const roleNames = user.roles || [];
    console.log("User ID:", userId, "Role names from DB:", roleNames);
    
    let role: string = "user";
    const roleNamesLower = roleNames.map((r: string) => r?.toLowerCase());
    if (roleNamesLower.includes("administrator") || roleNamesLower.includes("admin")) {
      role = "admin";
    } else if (roleNamesLower.includes("agent")) {
      role = "agent";
    }
    
    console.log("Mapped role:", role);
    
    const response = {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
        phone: user.phone,
        role: role,
      },
    };
    
    console.log("Sending response:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("Error in /api/me:", error);
    res.status(500).json({ message: "Error", error: String(error) });
  }
});
// GET /api/companies - Get list of companies
app.get("/api/companies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM transport_companies ORDER BY name"
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    // If table doesn't exist, return empty array instead of 500
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn("Companies table may not exist yet, returning empty array");
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching companies", error: String(error) });
  }
});

// GET /api/transport-types - Get list of transport types
app.get("/api/transport-types", async (req, res) => {
  try {
    // Check which columns exist
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transport_types'
    `);
    const existingColumns = columnsResult.rows.map(r => r.column_name.toLowerCase());
    
    let selectFields = ['id'];
    
    // Always include code if it exists
    if (existingColumns.includes('code')) {
      selectFields.push('code');
    }
    
    // Include name or label
    if (existingColumns.includes('name')) {
      selectFields.push('name');
    } else if (existingColumns.includes('label')) {
      selectFields.push('label as name');
    }
    
    // Also include label separately if it exists (for fallback)
    if (existingColumns.includes('label') && !existingColumns.includes('name')) {
      selectFields.push('label');
    }
    
    // Include type_name alias for backward compatibility
    if (existingColumns.includes('type_name')) {
      selectFields.push('type_name');
    } else if (existingColumns.includes('code')) {
      selectFields.push('code as type_name');
    }
    
    const query = `SELECT ${selectFields.join(', ')} FROM transport_types ORDER BY ${existingColumns.includes('name') ? 'name' : existingColumns.includes('label') ? 'label' : 'id'}`;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching transport types:", error);
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('existiert nicht')) {
      console.warn("Transport types table may not exist yet, returning empty array");
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching transport types", error: String(error) });
  }
});

// GET /api/stations - Get list of stations
app.get("/api/stations", async (req, res) => {
  try {
    const { city_id } = req.query;
    let query = "SELECT s.id, s.name, s.city_id, c.name AS city_name FROM stations s LEFT JOIN cities c ON s.city_id = c.id";
    const values: any[] = [];

    if (city_id) {
      query += " WHERE s.city_id = $1";
      values.push(city_id);
    }

    query += " ORDER BY c.name, s.name";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching stations:", error);
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn("Stations table may not exist yet, returning empty array");
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching stations", error: String(error) });
  }
});

app.use("/api/admin", adminRoutes);
// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
