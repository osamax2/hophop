import { pool } from "../db";

export interface Trip {
  id: number;
  route_id: number;
  company_id: number;
  transport_type_id: number;
  departure_station_id: number;
  arrival_station_id: number;
  departure_time: Date;
  arrival_time: Date;
  duration_minutes: number;
  seats_total: number;
  seats_available: number;
  status: string;
  is_active: boolean;
  equipment?: string;
  cancellation_policy?: string;
  extra_info?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTripDto {
  route_id: number;
  company_id: number;
  transport_type_id: number;
  departure_station_id: number;
  arrival_station_id: number;
  departure_time: Date | string;
  arrival_time: Date | string;
  duration_minutes: number;
  seats_total: number;
  seats_available?: number;
  status?: string;
  is_active?: boolean;
  equipment?: string;
  cancellation_policy?: string;
  extra_info?: string;
}

export interface UpdateTripDto {
  route_id?: number;
  company_id?: number;
  transport_type_id?: number;
  departure_station_id?: number;
  arrival_station_id?: number;
  departure_time?: Date | string;
  arrival_time?: Date | string;
  duration_minutes?: number;
  seats_total?: number;
  seats_available?: number;
  status?: string;
  is_active?: boolean;
  equipment?: string;
  cancellation_policy?: string;
  extra_info?: string;
}

export class TripsService {
  /**
   * الحصول على جميع الرحلات
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<Trip[]> {
    const result = await pool.query(
      `SELECT id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id,
              departure_time, arrival_time, duration_minutes, seats_total, seats_available,
              status, is_active, equipment, cancellation_policy, extra_info, created_at, updated_at
       FROM trips
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * الحصول على رحلة بواسطة ID
   */
  async findById(id: number): Promise<Trip | null> {
    const result = await pool.query(
      `SELECT id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id,
              departure_time, arrival_time, duration_minutes, seats_total, seats_available,
              status, is_active, equipment, cancellation_policy, extra_info, created_at, updated_at
       FROM trips
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * البحث عن رحلات بمعايير محددة
   */
  async search(filters: {
    fromCityId?: number;
    toCityId?: number;
    date?: string;
    status?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Trip[]> {
    let query = `
      SELECT
        t.id, t.route_id, t.company_id, t.transport_type_id,
        t.departure_station_id, t.arrival_station_id,
        t.departure_time, t.arrival_time, t.duration_minutes,
        t.seats_total, t.seats_available, t.status, t.is_active,
        t.equipment, t.cancellation_policy, t.extra_info,
        t.created_at, t.updated_at
      FROM trips t
      JOIN routes r ON t.route_id = r.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.fromCityId) {
      query += ` AND r.from_city_id = $${paramIndex++}`;
      values.push(filters.fromCityId);
    }

    if (filters.toCityId) {
      query += ` AND r.to_city_id = $${paramIndex++}`;
      values.push(filters.toCityId);
    }

    if (filters.date) {
      query += ` AND DATE(t.departure_time) = $${paramIndex++}::date`;
      values.push(filters.date);
    }

    if (filters.status) {
      query += ` AND t.status = $${paramIndex++}`;
      values.push(filters.status);
    }

    if (filters.isActive !== undefined) {
      query += ` AND t.is_active = $${paramIndex++}`;
      values.push(filters.isActive);
    }

    query += ` ORDER BY t.departure_time ASC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * إنشاء رحلة جديدة
   */
  async create(data: CreateTripDto): Promise<Trip> {
    const result = await pool.query(
      `INSERT INTO trips (
        route_id, company_id, transport_type_id,
        departure_station_id, arrival_station_id,
        departure_time, arrival_time, duration_minutes,
        seats_total, seats_available,
        status, is_active,
        equipment, cancellation_policy, extra_info
      )
      VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id,
                departure_time, arrival_time, duration_minutes, seats_total, seats_available,
                status, is_active, equipment, cancellation_policy, extra_info, created_at, updated_at`,
      [
        data.route_id,
        data.company_id,
        data.transport_type_id,
        data.departure_station_id,
        data.arrival_station_id,
        data.departure_time,
        data.arrival_time,
        data.duration_minutes,
        data.seats_total,
        data.seats_available !== undefined ? data.seats_available : data.seats_total,
        data.status || "scheduled",
        data.is_active !== undefined ? data.is_active : true,
        data.equipment || null,
        data.cancellation_policy || null,
        data.extra_info || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * تحديث رحلة
   */
  async update(id: number, data: UpdateTripDto): Promise<Trip | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.route_id !== undefined) {
      updates.push(`route_id = $${paramIndex++}`);
      values.push(data.route_id);
    }
    if (data.company_id !== undefined) {
      updates.push(`company_id = $${paramIndex++}`);
      values.push(data.company_id);
    }
    if (data.transport_type_id !== undefined) {
      updates.push(`transport_type_id = $${paramIndex++}`);
      values.push(data.transport_type_id);
    }
    if (data.departure_station_id !== undefined) {
      updates.push(`departure_station_id = $${paramIndex++}`);
      values.push(data.departure_station_id);
    }
    if (data.arrival_station_id !== undefined) {
      updates.push(`arrival_station_id = $${paramIndex++}`);
      values.push(data.arrival_station_id);
    }
    if (data.departure_time !== undefined) {
      updates.push(`departure_time = $${paramIndex++}::timestamp`);
      values.push(data.departure_time);
    }
    if (data.arrival_time !== undefined) {
      updates.push(`arrival_time = $${paramIndex++}::timestamp`);
      values.push(data.arrival_time);
    }
    if (data.duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      values.push(data.duration_minutes);
    }
    if (data.seats_total !== undefined) {
      updates.push(`seats_total = $${paramIndex++}`);
      values.push(data.seats_total);
    }
    if (data.seats_available !== undefined) {
      updates.push(`seats_available = $${paramIndex++}`);
      values.push(data.seats_available);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }
    if (data.equipment !== undefined) {
      updates.push(`equipment = $${paramIndex++}`);
      values.push(data.equipment);
    }
    if (data.cancellation_policy !== undefined) {
      updates.push(`cancellation_policy = $${paramIndex++}`);
      values.push(data.cancellation_policy);
    }
    if (data.extra_info !== undefined) {
      updates.push(`extra_info = $${paramIndex++}`);
      values.push(data.extra_info);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE trips
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id,
                 departure_time, arrival_time, duration_minutes, seats_total, seats_available,
                 status, is_active, equipment, cancellation_policy, extra_info, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * حذف رحلة
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM trips WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const tripsService = new TripsService();
