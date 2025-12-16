import { pool } from "../db";

export interface City {
  id: number;
  name: string;
  country_code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCityDto {
  name: string;
}

export interface UpdateCityDto {
  name?: string;
}

export class CitiesService {
  /**
   * الحصول على جميع المدن
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<City[]> {
    try {
      // First, check which columns exist
      const columnsResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cities'
      `);
      const existingColumns = columnsResult.rows.map(r => r.column_name.toLowerCase());
      
      // Build SELECT clause based on existing columns
      const selectFields: string[] = ['id', 'name'];
      
      if (existingColumns.includes('country_code')) {
        selectFields.push("COALESCE(country_code, 'SY') as country_code");
      } else {
        selectFields.push("'SY' as country_code");
      }
      
      if (existingColumns.includes('address')) {
        selectFields.push('address');
      } else {
        selectFields.push('NULL as address');
      }
      
      if (existingColumns.includes('latitude')) {
        selectFields.push('latitude');
      } else {
        selectFields.push('NULL as latitude');
      }
      
      if (existingColumns.includes('longitude')) {
        selectFields.push('longitude');
      } else {
        selectFields.push('NULL as longitude');
      }
      
      if (existingColumns.includes('created_at')) {
        selectFields.push('created_at');
      }
      
      if (existingColumns.includes('updated_at')) {
        selectFields.push('updated_at');
      }
      
      const query = `
        SELECT ${selectFields.join(', ')}
        FROM cities
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error: any) {
      console.error('Error in findAll cities:', error);
      // Final fallback: only select id and name
      try {
        const result = await pool.query(
          `SELECT id, name
           FROM cities
           ORDER BY name ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        return result.rows.map(row => ({
          ...row,
          country_code: 'SY',
          address: null,
          latitude: null,
          longitude: null,
        }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * الحصول على مدينة بواسطة ID
   */
  async findById(id: number): Promise<City | null> {
    const result = await pool.query(
      `SELECT id, name, created_at, updated_at
       FROM cities
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * البحث عن مدينة بالاسم
   */
  async findByName(name: string): Promise<City | null> {
    try {
      const result = await pool.query(
        `SELECT id, name, 
         COALESCE(country_code, 'SY') as country_code, 
         address, 
         latitude, 
         longitude
         FROM cities
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      console.error('Error in findByName cities:', error);
      const result = await pool.query(
        `SELECT id, name
         FROM cities
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
      const row = result.rows[0];
      return row ? { ...row, country_code: 'SY', address: null, latitude: null, longitude: null } : null;
    }
  }

  /**
   * البحث عن مدن (بحث جزئي)
   */
  async search(searchTerm: string, limit: number = 50): Promise<City[]> {
    try {
      const result = await pool.query(
        `SELECT id, name, 
         COALESCE(country_code, 'SY') as country_code, 
         address, 
         latitude, 
         longitude
         FROM cities
         WHERE LOWER(name) LIKE LOWER($1)
         ORDER BY name ASC
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return result.rows;
    } catch (error: any) {
      console.error('Error in search cities:', error);
      const result = await pool.query(
        `SELECT id, name
         FROM cities
         WHERE LOWER(name) LIKE LOWER($1)
         ORDER BY name ASC
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return result.rows.map(row => ({
        ...row,
        country_code: 'SY',
        address: null,
        latitude: null,
        longitude: null,
      }));
    }
  }

  /**
   * إنشاء مدينة جديدة
   */
  async create(data: CreateCityDto): Promise<City> {
    const result = await pool.query(
      `INSERT INTO cities (name)
       VALUES ($1)
       RETURNING id, name`,
      [data.name]
    );
    return {
      ...result.rows[0],
      country_code: 'SY',
      address: null,
      latitude: null,
      longitude: null,
    };
  }

  /**
   * تحديث مدينة
   */
  async update(id: number, data: UpdateCityDto): Promise<City | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE cities
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, name`,
      values
    );

    const row = result.rows[0];
    return row ? {
      ...row,
      country_code: 'SY',
      address: null,
      latitude: null,
      longitude: null,
    } : null;
  }

  /**
   * حذف مدينة
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM cities WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * التحقق من وجود مدينة بالاسم
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM cities WHERE LOWER(name) = LOWER($1)`;
    const values: any[] = [name];

    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }
}

export const citiesService = new CitiesService();
