// Script to check if a user exists in the database and test login
// Usage: node check_user_login.js <email> [password]

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUser(email, password = null) {
  try {
    console.log(`\n🔍 Checking user: ${email}\n`);

    // Check if user exists
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      console.log('\n💡 To create test users, run:');
      console.log('   cd backend && node create_test_users.js\n');
      return;
    }

    const user = result.rows[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A');
    console.log(`   Active: ${user.is_active ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${user.created_at}`);

    // Check roles
    const rolesResult = await pool.query(
      `SELECT r.name, r.code
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    if (rolesResult.rows.length > 0) {
      console.log(`   Roles: ${rolesResult.rows.map(r => r.name || r.code).join(', ')}`);
    } else {
      console.log('   Roles: None assigned');
    }

    // Test password if provided
    if (password) {
      console.log('\n🔐 Testing password...');
      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
          console.log('✅ Password is CORRECT');
        } else {
          console.log('❌ Password is INCORRECT');
          console.log('\n💡 If you forgot the password, you can reset it or create a new test user.');
        }
      } catch (error) {
        console.log('❌ Error comparing password:', error.message);
      }
    } else {
      console.log('\n💡 To test password, provide it as second argument:');
      console.log(`   node check_user_login.js ${email} yourpassword`);
    }

    // Check if user can login (is_active check)
    if (!user.is_active) {
      console.log('\n⚠️  WARNING: User account is INACTIVE');
      console.log('   This user cannot login even with correct password.');
      console.log('   To activate: UPDATE users SET is_active = true WHERE email = $1');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await pool.end();
  }
}

// Get arguments
const email = process.argv[2];
const password = process.argv[3] || null;

if (!email) {
  console.log('Usage: node check_user_login.js <email> [password]');
  console.log('\nExample:');
  console.log('  node check_user_login.js admin@test.com');
  console.log('  node check_user_login.js admin@test.com admin123');
  process.exit(1);
}

checkUser(email, password);
