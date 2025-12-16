// Check user roles
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkRoles() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.first_name,
        u.last_name,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.email = $1
      GROUP BY u.id, u.email, u.first_name, u.last_name
    `, ['admin@test.com']);
    
    console.log('Admin user roles:', JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkRoles();
