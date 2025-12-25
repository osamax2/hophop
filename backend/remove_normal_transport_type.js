/**
 * سكريبت إزالة نوع النقل "عادي" (NORMAL) من قاعدة البيانات
 * Script to remove NORMAL transport type from database
 */

require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ خطأ: DATABASE_URL غير موجود في ملف .env');
  console.error('❌ Error: DATABASE_URL not found in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function removeNormalTransportType() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🗑️  إزالة نوع النقل "عادي" (NORMAL) من قاعدة البيانات...');
    console.log('🗑️  Removing NORMAL transport type from database...\n');

    // Check if NORMAL transport type exists
    const checkResult = await client.query(
      'SELECT id, code, label FROM transport_types WHERE code = $1',
      ['NORMAL']
    );

    if (checkResult.rows.length === 0) {
      console.log('  ℹ️  نوع النقل "عادي" غير موجود في قاعدة البيانات');
      console.log('  ℹ️  NORMAL transport type does not exist in database');
    } else {
      const type = checkResult.rows[0];
      
      // Check if any trips are using this transport type
      const tripsCheck = await client.query(
        'SELECT COUNT(*) as count FROM trips WHERE transport_type_id = $1',
        [type.id]
      );
      const tripsCount = parseInt(tripsCheck.rows[0].count);

      if (tripsCount > 0) {
        console.log(`  ⚠️  تحذير: يوجد ${tripsCount} رحلة تستخدم هذا النوع`);
        console.log(`  ⚠️  Warning: ${tripsCount} trips are using this transport type`);
        console.log('  ❌ لن يتم الحذف لتجنب فقدان البيانات');
        console.log('  ❌ Deletion cancelled to prevent data loss');
      } else {
        // Delete the transport type
        await client.query(
          'DELETE FROM transport_types WHERE code = $1',
          ['NORMAL']
        );
        console.log(`  ✅ تم حذف: ${type.code} - ${type.label} (ID: ${type.id})`);
        console.log(`  ✅ Deleted: ${type.code} - ${type.label} (ID: ${type.id})`);
      }
    }

    await client.query('COMMIT');

    // Display remaining transport types
    const allTypes = await client.query(
      'SELECT id, code, label FROM transport_types ORDER BY id'
    );
    
    console.log('\n📋 أنواع النقل المتبقية في قاعدة البيانات:');
    console.log('📋 Remaining transport types in database:');
    allTypes.rows.forEach((type) => {
      console.log(`  ${type.id}. ${type.code} - ${type.label}`);
    });

    console.log('\n✅ تم بنجاح! / Success!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ خطأ في حذف نوع النقل:', error);
    console.error('❌ Error removing transport type:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
removeNormalTransportType();

