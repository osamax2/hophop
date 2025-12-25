import { pool } from "../db";

export interface User {
  id: number;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: Date;
  address?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserDto {
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: Date;
  address?: string;
  is_active?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: Date;
  address?: string;
  is_active?: boolean;
}

export class UsersService {
  /**
   * الحصول على جميع المستخدمين
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, gender, date_of_birth, address, is_active, created_at, updated_at
       FROM users
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * الحصول على مستخدم بواسطة ID
   */
  async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, gender, date_of_birth, address, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * الحصول على مستخدم بواسطة البريد الإلكتروني
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, phone, gender, date_of_birth, address, is_active, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * إنشاء مستخدم جديد
   */
  async create(data: CreateUserDto): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, gender, date_of_birth, address, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, first_name, last_name, phone, gender, date_of_birth, address, is_active, created_at, updated_at`,
      [
        data.email,
        data.password_hash,
        data.first_name || null,
        data.last_name || null,
        data.phone || null,
        data.gender || null,
        data.date_of_birth || null,
        data.address || null,
        data.is_active !== undefined ? data.is_active : true,
      ]
    );
    return result.rows[0];
  }

  /**
   * تحديث مستخدم
   */
  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.gender !== undefined) {
      updates.push(`gender = $${paramIndex++}`);
      values.push(data.gender);
    }
    if (data.date_of_birth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex++}::date`);
      values.push(data.date_of_birth);
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(data.address);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, phone, gender, date_of_birth, address, is_active, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * حذف مستخدم (soft delete - تعطيل الحساب)
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`UPDATE users SET is_active = false WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * التحقق من وجود مستخدم بالبريد الإلكتروني
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM users WHERE email = $1`;
    const values: any[] = [email];

    if (excludeId) {
      query += ` AND id != $2`;
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }
}

export const usersService = new UsersService();
