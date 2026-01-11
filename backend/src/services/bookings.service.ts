import { pool } from "../db";

export interface Booking {
  id: number;
  user_id: number;
  trip_id: number;
  booking_status: string;
  seats_booked: number;
  total_price: number;
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBookingDto {
  user_id: number;
  trip_id: number;
  booking_status?: string;
  seats_booked: number;
  total_price: number;
  currency?: string;
  fare_category_id?: number;
  booking_option_id?: number;
}

export interface UpdateBookingDto {
  booking_status?: string;
  seats_booked?: number;
  total_price?: number;
  currency?: string;
}

export class BookingsService {
  /**
   * الحصول على جميع الحجوزات
   */
  async findAll(limit: number = 100, offset: number = 0, userId?: number): Promise<Booking[]> {
    let query = `SELECT id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at
                 FROM bookings`;
    const values: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` WHERE user_id = $${paramIndex++}`;
      values.push(userId);
    }

    query += ` ORDER BY id DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * الحصول على حجز بواسطة ID
   */
  async findById(id: number): Promise<Booking | null> {
    const result = await pool.query(
      `SELECT id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at
       FROM bookings
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * الحصول على حجوزات مستخدم معين
   */
  async findByUserId(userId: number, limit: number = 100, offset: number = 0): Promise<Booking[]> {
    const result = await pool.query(
      `SELECT id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * الحصول على حجوزات رحلة معينة
   */
  async findByTripId(tripId: number, limit: number = 100, offset: number = 0): Promise<Booking[]> {
    const result = await pool.query(
      `SELECT id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at
       FROM bookings
       WHERE trip_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [tripId, limit, offset]
    );
    return result.rows;
  }

  /**
   * إنشاء حجز جديد
   */
  async create(data: CreateBookingDto): Promise<Booking> {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, trip_id, booking_status, seats_booked, total_price, currency, fare_category_id, booking_option_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at`,
      [
        data.user_id,
        data.trip_id,
        data.booking_status || "confirmed",
        data.seats_booked,
        data.total_price,
        data.currency || "USD",
        data.fare_category_id || null,
        data.booking_option_id || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * تحديث حجز
   */
  async update(id: number, data: UpdateBookingDto): Promise<Booking | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.booking_status !== undefined) {
      updates.push(`booking_status = $${paramIndex++}`);
      values.push(data.booking_status);
    }
    if (data.seats_booked !== undefined) {
      updates.push(`seats_booked = $${paramIndex++}`);
      values.push(data.seats_booked);
    }
    if (data.total_price !== undefined) {
      updates.push(`total_price = $${paramIndex++}`);
      values.push(data.total_price);
    }
    if (data.currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(data.currency);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE bookings
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * حذف حجز
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM bookings WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * التحقق من وجود رحلة
   */
  async tripExists(tripId: number): Promise<boolean> {
    const result = await pool.query(`SELECT COUNT(*) as count FROM trips WHERE id = $1`, [tripId]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * التحقق من وجود مستخدم
   */
  async userExists(userId: number): Promise<boolean> {
    const result = await pool.query(`SELECT COUNT(*) as count FROM users WHERE id = $1`, [userId]);
    return parseInt(result.rows[0].count) > 0;
  }
}

export const bookingsService = new BookingsService();
