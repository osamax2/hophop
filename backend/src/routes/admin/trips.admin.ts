import { Router } from "express";
import { pool } from "../../db";

const router = Router();

// GET /api/admin/trips
router.get("/", async (req, res) => {
  // Optional query parameter to show all trips (including inactive) or only active
  const showAll = req.query.showAll === 'true';
  const whereClause = showAll ? '' : 'WHERE t.is_active = true';
  
  console.log(`Fetching trips, showAll: ${showAll}, whereClause: ${whereClause}`);
  
  const r = await pool.query(
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
    ${whereClause}
    ORDER BY t.id DESC
    LIMIT 200
    `
  );
  
  console.log(`Returning ${r.rows.length} trips`);
  res.json(r.rows);
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
        $9,$9,
        $10,$11,
        $12,$13,$14,
        $15,$16,$17
      )
      RETURNING *
      `,
      [
        route_id, company_id, transport_type_id,
        departure_station_id, arrival_station_id,
        departure_time, arrival_time, duration_minutes,
        seats_total,
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
    res.status(201).json(trip);
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
  const { price, currency } = req.body;

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

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${idx++}${key.includes("time") ? "::timestamp" : ""}`);
      values.push(req.body[key]);
    }
  }

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

    // Get updated trip
    const tripResult = await client.query(`SELECT * FROM trips WHERE id = $1`, [id]);
    res.json(tripResult.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Error updating trip", error: String(error) });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/trips/:id (Hard Delete - permanently deletes trip)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    console.log(`Attempting to permanently delete trip ${id}...`);

    // Check if trip exists
    const checkResult = await pool.query(`SELECT id FROM trips WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    console.log(`Trip ${id} found, performing permanent deletion (hard delete)`);
    
    // Always perform hard delete (permanent deletion) - no soft delete
    {
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
    }
  } catch (error: any) {
    console.error("Error deactivating trip:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      message: "Error deactivating trip", 
      error: error.message || String(error),
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
