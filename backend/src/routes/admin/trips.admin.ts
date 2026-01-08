import { Router } from "express";
import { pool } from "../../db";
import jwt from "jsonwebtoken";

const router = Router();

// Helper function to get user info from token
async function getUserFromToken(req: any): Promise<{id: number, company_id: number | null, agent_type: string | null, isAdmin: boolean} | null> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return null;

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as { id: number };
    
    // Get user with company_id and agent_type
    const result = await pool.query(`
      SELECT u.id, u.company_id, ut.code as agent_type,
             EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name = 'Administrator') as is_admin
      FROM users u
      LEFT JOIN user_types ut ON u.user_type_id = ut.id
      WHERE u.id = $1
    `, [payload.id]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      company_id: user.company_id,
      agent_type: user.agent_type,
      isAdmin: user.is_admin
    };
  } catch (err) {
    return null;
  }
}

// GET /api/admin/trips
router.get("/", async (req, res) => {
  try {
    const showAll = req.query.showAll === 'true';
    const showTrash = req.query.showTrash === 'true';
    
    // Get user from token to determine filtering
    const currentUser = await getUserFromToken(req);
    const isAgentManager = currentUser && !currentUser.isAdmin && currentUser.agent_type === 'manager' && currentUser.company_id;
    
    // Check which columns exist in trips table
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='trips' AND column_name IN ('deleted_at', 'is_active')
    `);
    
    const existingColumns = columnsCheck.rows.map((row: any) => row.column_name);
    const hasDeletedAt = existingColumns.includes('deleted_at');
    const hasIsActive = existingColumns.includes('is_active');
    
    console.log(`Trips table columns check: deleted_at=${hasDeletedAt}, is_active=${hasIsActive}`);
    
    let whereClause = '';
    if (showTrash && hasDeletedAt) {
      whereClause = 'WHERE t.deleted_at IS NOT NULL';
    } else {
      if (hasDeletedAt) {
        whereClause = 'WHERE t.deleted_at IS NULL';
      } else {
        whereClause = 'WHERE 1=1'; // No deleted_at column, use dummy condition
      }
      
      // Only filter by is_active if showAll is false
      if (!showAll && hasIsActive) {
        whereClause += ' AND t.is_active = true';
      }
    }
    
    // Auto-filter by company_id for agent managers (from token, not query params)
    if (isAgentManager && currentUser.company_id) {
      whereClause += ` AND t.company_id = ${currentUser.company_id}`;
    }
    
    console.log(`Fetching trips, showAll: ${showAll}, showTrash: ${showTrash}, isAgentManager: ${isAgentManager}, companyId: ${currentUser?.company_id}, whereClause: ${whereClause}`);
    
    const query = `
      SELECT
        t.*,
        c1.name as from_city,
        c2.name as to_city,
        COALESCE(comp.name, 'Unknown') AS company_name,
        tt.label as transport_type_name,
        tt.code as transport_type_code,
        COALESCE((
          SELECT price FROM trip_fares tf 
          WHERE tf.trip_id = t.id 
          LIMIT 1
        ), 0) as price
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      JOIN cities c1 ON c1.id = r.from_city_id
      JOIN cities c2 ON c2.id = r.to_city_id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      ${whereClause}
      ORDER BY t.id DESC
      LIMIT 200
    `;
    
    console.log('Executing query:', query.substring(0, 200) + '...');
    
    const r = await pool.query(query);
    
    console.log(`Returning ${r.rows.length} trips`);
    res.json(r.rows);
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Error fetching trips", 
      error: error.message || String(error),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/admin/trips/:id/steps - Get route stops for a trip
router.get("/:id/steps", async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    
    const trip = await pool.query('SELECT route_id FROM trips WHERE id = $1', [tripId]);
    if (trip.rows.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const routeId = trip.rows[0].route_id;
    
    const result = await pool.query(
      `
      SELECT 
        rs.id,
        rs.route_id,
        rs.station_id,
        rs.stop_order,
        rs.arrival_time,
        rs.departure_time,
        s.name as station_name,
        c.name as city_name
      FROM route_stops rs
      JOIN stations s ON rs.station_id = s.id
      LEFT JOIN cities c ON s.city_id = c.id
      WHERE rs.route_id = $1
      ORDER BY rs.stop_order
      `,
      [routeId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching trip steps:', error);
    res.status(500).json({ message: 'Error fetching trip steps', error: String(error) });
  }
});

// POST /api/admin/trips/:id/steps - Add a route stop
router.post("/:id/steps", async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { station_id, stop_order, arrival_time, departure_time } = req.body;
    
    if (!station_id || !stop_order) {
      return res.status(400).json({ message: 'station_id and stop_order are required' });
    }
    
    const trip = await pool.query('SELECT route_id FROM trips WHERE id = $1', [tripId]);
    if (trip.rows.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const routeId = trip.rows[0].route_id;
    
    const result = await pool.query(
      `
      INSERT INTO route_stops (route_id, station_id, stop_order, arrival_time, departure_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [routeId, station_id, stop_order, arrival_time || null, departure_time || null]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Stop added successfully' });
  } catch (error: any) {
    console.error('Error adding trip step:', error);
    res.status(500).json({ message: 'Error adding trip step', error: String(error) });
  }
});

// DELETE /api/admin/trips/:id/steps/:stepId - Remove a route stop
router.delete("/:id/steps/:stepId", async (req, res) => {
  try {
    const stepId = Number(req.params.stepId);
    
    await pool.query('DELETE FROM route_stops WHERE id = $1', [stepId]);
    
    res.json({ message: 'Stop removed successfully' });
  } catch (error: any) {
    console.error('Error removing trip step:', error);
    res.status(500).json({ message: 'Error removing trip step', error: String(error) });
  }
});

// POST /api/admin/trips
router.post("/", async (req, res) => {
  const {
    route_id,
    company_id,
    transport_type_id,
    departure_station_id,
    arrival_station_id,
    departure_time, // timestamp string
    arrival_time,   // timestamp string
    duration_minutes,
    seats_total,
    price,
    currency = "SYP",
    bus_number = null,
    driver_name = null,
    status = "scheduled",
    is_active = true,
    equipment = null,
    cancellation_policy = null,
    extra_info = null,
  } = req.body;

  if (
    !route_id || !company_id || !transport_type_id ||
    !departure_station_id || !arrival_station_id ||
    !departure_time || !arrival_time ||
    !duration_minutes || !seats_total
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert trip
    const tripResult = await client.query(
      `
      INSERT INTO trips (
        route_id, company_id, transport_type_id,
        departure_station_id, arrival_station_id,
        departure_time, arrival_time, duration_minutes,
        seats_total, seats_available,
        status, is_active,
        bus_number, driver_name,
        equipment, cancellation_policy, extra_info
      )
      VALUES (
        $1,$2,$3,
        $4,$5,
        $6::timestamp,$7::timestamp,$8,
        $9,$10,
        $11,$12,
        $13,$14,
        $15,$16,$17
      )
      RETURNING *
      `,
      [
        route_id, company_id, transport_type_id,
        departure_station_id, arrival_station_id,
        departure_time, arrival_time, duration_minutes,
        seats_total, seats_total, // seats_available = seats_total initially
        status, is_active,
        bus_number, driver_name,
        equipment, cancellation_policy, extra_info
      ]
    );

    const trip = tripResult.rows[0];

    // Create trip_fare if price is provided
    if (price !== null && price !== undefined && price !== '') {
      // Get STANDARD fare_category_id and DEFAULT booking_option_id
      const fareCategoryResult = await client.query(
        `SELECT id FROM fare_categories WHERE code = 'STANDARD' LIMIT 1`
      );
      const bookingOptionResult = await client.query(
        `SELECT id FROM booking_options WHERE code = 'DEFAULT' AND transport_type_id = $1 LIMIT 1`,
        [transport_type_id]
      );

      if (fareCategoryResult.rows.length > 0 && bookingOptionResult.rows.length > 0) {
        const fareCategoryId = fareCategoryResult.rows[0].id;
        const bookingOptionId = bookingOptionResult.rows[0].id;

        await client.query(
          `
          INSERT INTO trip_fares (
            trip_id, fare_category_id, booking_option_id,
            price, currency, seats_available
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            trip.id,
            fareCategoryId,
            bookingOptionId,
            parseFloat(price),
            currency,
            seats_total
          ]
        );
      }
    }

    await client.query("COMMIT");
    
    // Get the created trip with all JOIN data (same as GET /api/admin/trips)
    const fullTripResult = await client.query(
      `
      SELECT
        t.*,
        c1.name as from_city,
        c2.name as to_city,
        COALESCE(comp.name, 'Unknown') AS company_name
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      JOIN cities c1 ON c1.id = r.from_city_id
      JOIN cities c2 ON c2.id = r.to_city_id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      WHERE t.id = $1
      `,
      [trip.id]
    );
    
    res.status(201).json(fullTripResult.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Error creating trip", error: String(error) });
  } finally {
    client.release();
  }
});

// PATCH /api/admin/trips/:id
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { price, currency, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id } = req.body;

  console.log(`PATCH /api/admin/trips/${id} - Request body:`, req.body);

  // تحديثات بسيطة شائعة
  const allowed = [
    "departure_time",
    "arrival_time",
    "duration_minutes",
    "seats_total",
    "seats_available",
    "status",
    "is_active",
    "bus_number",
    "driver_name",
    "equipment",
    "cancellation_policy",
    "extra_info",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  // Handle route_id, company_id, transport_type_id, station IDs (numeric fields)
  if (route_id !== undefined && route_id !== null && route_id !== '') {
    updates.push(`route_id = $${idx++}`);
    values.push(Number(route_id));
  }
  if (company_id !== undefined && company_id !== null && company_id !== '') {
    updates.push(`company_id = $${idx++}`);
    values.push(Number(company_id));
  }
  if (transport_type_id !== undefined && transport_type_id !== null && transport_type_id !== '') {
    updates.push(`transport_type_id = $${idx++}`);
    values.push(Number(transport_type_id));
  }
  if (departure_station_id !== undefined && departure_station_id !== null && departure_station_id !== '') {
    updates.push(`departure_station_id = $${idx++}`);
    values.push(Number(departure_station_id));
  }
  if (arrival_station_id !== undefined && arrival_station_id !== null && arrival_station_id !== '') {
    updates.push(`arrival_station_id = $${idx++}`);
    values.push(Number(arrival_station_id));
  }

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${idx++}${key.includes("time") ? "::timestamp" : ""}`);
      values.push(req.body[key]);
    }
  }

  console.log(`PATCH /api/admin/trips/${id} - Updates:`, updates, 'Values:', values);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update trip if there are updates
    if (updates.length > 0) {
      values.push(id);
      const q = `UPDATE trips SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`;
      await client.query(q, values);
    }

    // Update or create trip_fare if price is provided
    if (price !== null && price !== undefined && price !== '') {
      // Get trip to find transport_type_id
      const tripResult = await client.query(`SELECT transport_type_id FROM trips WHERE id = $1`, [id]);
      if (tripResult.rows.length > 0) {
        const transportTypeId = tripResult.rows[0].transport_type_id;

        // Get STANDARD fare_category_id and DEFAULT booking_option_id
        const fareCategoryResult = await client.query(
          `SELECT id FROM fare_categories WHERE code = 'STANDARD' LIMIT 1`
        );
        const bookingOptionResult = await client.query(
          `SELECT id FROM booking_options WHERE code = 'DEFAULT' AND transport_type_id = $1 LIMIT 1`,
          [transportTypeId]
        );

        if (fareCategoryResult.rows.length > 0 && bookingOptionResult.rows.length > 0) {
          const fareCategoryId = fareCategoryResult.rows[0].id;
          const bookingOptionId = bookingOptionResult.rows[0].id;

          // Check if fare exists
          const existingFare = await client.query(
            `SELECT id FROM trip_fares WHERE trip_id = $1 AND fare_category_id = $2 AND booking_option_id = $3`,
            [id, fareCategoryId, bookingOptionId]
          );

          if (existingFare.rows.length > 0) {
            // Update existing fare
            await client.query(
              `UPDATE trip_fares SET price = $1, currency = $2 WHERE id = $3`,
              [parseFloat(price), currency || 'SYP', existingFare.rows[0].id]
            );
          } else {
            // Create new fare
            const seatsResult = await client.query(`SELECT seats_total FROM trips WHERE id = $1`, [id]);
            const seatsTotal = seatsResult.rows[0]?.seats_total || 0;
            
            await client.query(
              `INSERT INTO trip_fares (trip_id, fare_category_id, booking_option_id, price, currency, seats_available)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [id, fareCategoryId, bookingOptionId, parseFloat(price), currency || 'SYP', seatsTotal]
            );
          }
        }
      }
    }

    await client.query("COMMIT");

    // Get updated trip with all JOIN data (same as GET /api/admin/trips)
    const tripResult = await client.query(
      `
      SELECT
        t.*,
        c1.name as from_city,
        c2.name as to_city,
        COALESCE(comp.name, 'Unknown') AS company_name,
        tt.label as transport_type_name,
        tt.code as transport_type_code,
        COALESCE((
          SELECT price FROM trip_fares tf 
          WHERE tf.trip_id = t.id 
          LIMIT 1
        ), 0) as price
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      JOIN cities c1 ON c1.id = r.from_city_id
      JOIN cities c2 ON c2.id = r.to_city_id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      WHERE t.id = $1
      `,
      [id]
    );
    res.json(tripResult.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Error updating trip", error: String(error) });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/trips/:id (Soft Delete - moves to trash)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const permanent = req.query.permanent === 'true';
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    console.log(`Attempting to ${permanent ? 'permanently delete' : 'soft delete (trash)'} trip ${id}...`);

    // Check if trip exists
    const checkResult = await pool.query(`SELECT id, deleted_at FROM trips WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = checkResult.rows[0];
    
    // If permanent delete or already in trash, perform hard delete
    if (permanent || trip.deleted_at !== null) {
      console.log(`Trip ${id} performing permanent deletion (hard delete)`);
      
      // Hard delete: Permanently delete the trip and related data
      // Use transaction to ensure data consistency
      // For hard delete, delete related data first, then delete the trip
      // We'll delete in separate queries to avoid transaction abort issues
      
      console.log(`Starting hard delete for trip ${id}`);
      
      // Helper function to execute delete with fresh connection if transaction aborts
      const executeDelete = async (query: string, params: any[], tableName: string): Promise<number> => {
        let client = await pool.connect();
        try {
          const result = await client.query(query, params);
          client.release();
          return result.rowCount || 0;
        } catch (error: any) {
          client.release();
          
          if (error.code === '25P02') {
            // Transaction aborted - try again with fresh connection
            console.log(`Transaction aborted for ${tableName}, retrying with fresh connection...`);
            client = await pool.connect();
            try {
              const retryResult = await client.query(query, params);
              client.release();
              return retryResult.rowCount || 0;
            } catch (retryError: any) {
              client.release();
              throw retryError;
            }
          }
          throw error;
        }
      };
      
      try {
        // Delete invoices first (they reference bookings)
        try {
          const count = await executeDelete(
            'DELETE FROM invoices WHERE booking_id IN (SELECT id FROM bookings WHERE trip_id = $1)', 
            [id],
            'invoices'
          );
          console.log(`Deleted ${count} invoices for trip ${id}`);
        } catch (invoiceError: any) {
          if (invoiceError.code === '42P01') {
            console.log(`Invoices table does not exist, skipping...`);
          } else {
            console.log(`Note: Could not delete invoices: ${invoiceError.message} (code: ${invoiceError.code})`);
          }
        }
        
        // Delete bookings (must be deleted before trip due to foreign key without CASCADE)
        try {
          const count = await executeDelete('DELETE FROM bookings WHERE trip_id = $1', [id], 'bookings');
          console.log(`Deleted ${count} bookings for trip ${id}`);
        } catch (bookingsError: any) {
          if (bookingsError.code === '42P01') {
            console.log(`Bookings table does not exist, skipping...`);
          } else {
            console.log(`Error deleting bookings: ${bookingsError.message} (code: ${bookingsError.code})`);
            // This is critical - if bookings can't be deleted, trip can't be deleted
            throw bookingsError;
          }
        }
        
        // Delete trip_fares (must be deleted before trip due to foreign key)
        try {
          const count = await executeDelete('DELETE FROM trip_fares WHERE trip_id = $1', [id], 'trip_fares');
          console.log(`Deleted ${count} trip_fares for trip ${id}`);
        } catch (tripFaresError: any) {
          if (tripFaresError.code === '42P01') {
            console.log(`Trip_fares table does not exist, skipping...`);
          } else {
            console.log(`Error deleting trip_fares: ${tripFaresError.message} (code: ${tripFaresError.code})`);
            throw tripFaresError;
          }
        }
        
        // Delete images
        try {
          const count = await executeDelete(
            'DELETE FROM images WHERE entity_type = $1 AND entity_id = $2', 
            ['trip', id],
            'images'
          );
          console.log(`Deleted ${count} images for trip ${id}`);
        } catch (imagesError: any) {
          if (imagesError.code === '42P01') {
            console.log(`Images table does not exist, skipping...`);
          } else {
            console.log(`Note: Could not delete images: ${imagesError.message}`);
          }
        }
        
        // Note: favorites and reviews have ON DELETE CASCADE, so they'll be deleted automatically
        // when we delete the trip
        
        // Finally delete the trip itself
        console.log(`Attempting to delete trip ${id} from database...`);
        const deleteCount = await executeDelete('DELETE FROM trips WHERE id = $1', [id], 'trips');
        console.log(`Delete result for trip ${id}:`, deleteCount, 'rows deleted');
        
        if (deleteCount === 0) {
          console.error(`Trip ${id} not found`);
          return res.status(404).json({ message: "Trip not found" });
        }
        
        console.log(`Trip ${id} permanently deleted (hard delete)`);
        
        return res.json({ 
          ok: true, 
          message: "Trip permanently deleted",
          hardDelete: true,
          tripId: id
        });
      } catch (error: any) {
        console.error(`Error deleting trip ${id}:`, error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a foreign key constraint error
        if (error.code === '23503') {
          console.error(`Foreign key constraint violation - some related data still exists`);
          return res.status(500).json({ 
            message: "Cannot delete trip - related data still exists. Please delete related bookings, trip_fares, or other dependent records first.", 
            error: error.message || String(error),
            code: error.code,
            constraint: error.constraint
          });
        }
        
        return res.status(500).json({ 
          message: "Error permanently deleting trip", 
          error: error.message || String(error),
          code: error.code,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    } else {
      // Soft delete: Set deleted_at timestamp
      console.log(`Trip ${id} moving to trash (soft delete)`);
      
      await pool.query(
        'UPDATE trips SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      
      console.log(`Trip ${id} moved to trash`);
      
      return res.json({ 
        ok: true, 
        message: "Trip moved to trash",
        softDelete: true,
        tripId: id
      });
    }
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      message: "Error deleting trip", 
      error: error.message || String(error),
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/admin/trips/:id/restore - Restore trip from trash
router.post("/:id/restore", async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    console.log(`Attempting to restore trip ${id} from trash...`);

    // Check if trip exists and is in trash
    const checkResult = await pool.query(
      `SELECT id, deleted_at FROM trips WHERE id = $1`,
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    const trip = checkResult.rows[0];
    
    if (trip.deleted_at === null) {
      return res.status(400).json({ message: "Trip is not in trash" });
    }

    // Restore trip by setting deleted_at to NULL
    await pool.query(
      'UPDATE trips SET deleted_at = NULL WHERE id = $1',
      [id]
    );
    
    console.log(`Trip ${id} restored from trash`);
    
    // Get the restored trip with all data
    const restoredTrip = await pool.query(
      `
      SELECT
        t.*,
        c1.name as from_city,
        c2.name as to_city,
        COALESCE(comp.name, 'Unknown') AS company_name,
        tt.name as transport_type_name,
        tt.code as transport_type_code,
        COALESCE((
          SELECT price FROM trip_fares tf 
          WHERE tf.trip_id = t.id 
          LIMIT 1
        ), 0) as price
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      JOIN cities c1 ON c1.id = r.from_city_id
      JOIN cities c2 ON c2.id = r.to_city_id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
      WHERE t.id = $1
      `,
      [id]
    );
    
    res.json({ 
      ok: true, 
      message: "Trip restored from trash",
      trip: restoredTrip.rows[0]
    });
  } catch (error: any) {
    console.error("Error restoring trip:", error);
    res.status(500).json({ 
      message: "Error restoring trip", 
      error: error.message || String(error),
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
