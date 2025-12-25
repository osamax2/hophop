/**
 * سكريبت إضافة جميع أنواع النقل إلى قاعدة البيانات
 * Script to add all transport types to the database
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

const transportTypes = [
  { code: 'BUS', label: 'Bus' },
  { code: 'VAN', label: 'Van' },
  { code: 'VIP_VAN', label: 'VIP Van' },
  { code: 'SHIP', label: 'Ship' },
  { code: 'TRAIN', label: 'Train' },
  { code: 'NORMAL', label: 'Normal' },
];

async function addTransportTypes() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🚗 إضافة أنواع النقل إلى قاعدة البيانات...');
    console.log('🚗 Adding transport types to database...\n');

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const type of transportTypes) {
      try {
        // Check if transport type exists
        const checkResult = await client.query(
          'SELECT id, code, label FROM transport_types WHERE code = $1',
          [type.code]
        );

        if (checkResult.rows.length > 0) {
          // Update if label is different
          const existing = checkResult.rows[0];
          if (existing.label !== type.label) {
            await client.query(
              'UPDATE transport_types SET label = $1 WHERE code = $2',
              [type.label, type.code]
            );
            console.log(`  ✅ تم تحديث: ${type.code} - ${type.label}`);
            console.log(`  ✅ Updated: ${type.code} - ${type.label}`);
            updatedCount++;
          } else {
            console.log(`  ⏭️  موجود مسبقاً: ${type.code} - ${type.label}`);
            console.log(`  ⏭️  Already exists: ${type.code} - ${type.label}`);
            skippedCount++;
          }
        } else {
          // Insert new transport type
          const result = await client.query(
            'INSERT INTO transport_types (code, label) VALUES ($1, $2) RETURNING id',
            [type.code, type.label]
          );
          console.log(`  ➕ تم الإضافة: ${type.code} - ${type.label} (ID: ${result.rows[0].id})`);
          console.log(`  ➕ Added: ${type.code} - ${type.label} (ID: ${result.rows[0].id})`);
          addedCount++;
        }
      } catch (error) {
        console.error(`  ❌ خطأ في إضافة ${type.code}:`, error.message);
        console.error(`  ❌ Error adding ${type.code}:`, error.message);
      }
    }

    await client.query('COMMIT');

    console.log('\n📊 ملخص النتائج / Summary:');
    console.log(`  ➕ تمت الإضافة: ${addedCount}`);
    console.log(`  ➕ Added: ${addedCount}`);
    console.log(`  ✅ تم التحديث: ${updatedCount}`);
    console.log(`  ✅ Updated: ${updatedCount}`);
    console.log(`  ⏭️  تم التخطي: ${skippedCount}`);
    console.log(`  ⏭️  Skipped: ${skippedCount}`);

    // Display all transport types
    const allTypes = await pool.query(
      'SELECT id, code, label FROM transport_types ORDER BY id'
    );
    
    console.log('\n📋 جميع أنواع النقل في قاعدة البيانات:');
    console.log('📋 All transport types in database:');
    allTypes.rows.forEach((type) => {
      console.log(`  ${type.id}. ${type.code} - ${type.label}`);
    });

    console.log('\n✅ تم بنجاح! / Success!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ خطأ في إضافة أنواع النقل:', error);
    console.error('❌ Error adding transport types:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addTransportTypes();

