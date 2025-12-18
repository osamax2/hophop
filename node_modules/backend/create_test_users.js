// سكريبت إنشاء حسابات وهمية للاختبار
// Run: cd backend && node create_test_users.js

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestUsers() {
  try {
    console.log('Creating test users...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const agentPassword = await bcrypt.hash('agent123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Create roles if they don't exist (using name instead of code)
    await pool.query(`
      INSERT INTO roles (name, description) VALUES 
      ('Administrator', 'Full admin access'),
      ('Agent', 'Company agent access'),
      ('User', 'Regular user access')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Roles created/verified');

    // Create Admin user
    const adminResult = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, gender, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, [
      'admin@test.com',
      adminPassword,
      'Admin',
      'User',
      '+963123456789',
      'male',
      true
    ]);

    const adminId = adminResult.rows[0].id;

    // Assign ADMIN role (using name instead of code)
    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'Administrator'
      ON CONFLICT DO NOTHING
    `, [adminId]);
    console.log('✅ Admin user created: admin@test.com / admin123');

    // Create Agent user
    const agentResult = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, gender, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, [
      'agent@test.com',
      agentPassword,
      'Agent',
      'Company',
      '+963987654321',
      'male',
      true
    ]);

    const agentId = agentResult.rows[0].id;

    // Assign AGENT role (using name instead of code)
    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'Agent'
      ON CONFLICT DO NOTHING
    `, [agentId]);
    console.log('✅ Agent user created: agent@test.com / agent123');

    // Create regular User
    const userResult = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, gender, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, [
      'user@test.com',
      userPassword,
      'Test',
      'User',
      '+963555123456',
      'female',
      true
    ]);

    const userId = userResult.rows[0].id;

    // Assign USER role (using name instead of code)
    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r WHERE r.name = 'User'
      ON CONFLICT DO NOTHING
    `, [userId]);
    console.log('✅ User created: user@test.com / user123');

    console.log('\n🎉 All test users created successfully!\n');
    console.log('📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin Account:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Role: Administrator (صلاحيات كاملة)');
    console.log('');
    console.log('🏢 Agent Account:');
    console.log('   Email: agent@test.com');
    console.log('   Password: agent123');
    console.log('   Role: Agent (يمكن إضافة رحلات)');
    console.log('');
    console.log('👥 User Account:');
    console.log('   Email: user@test.com');
    console.log('   Password: user123');
    console.log('   Role: User (مستخدم عادي)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestUsers();
