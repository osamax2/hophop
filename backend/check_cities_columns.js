// Script to check and add missing columns to cities table
// Run: cd backend && node check_cities_columns.js

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAndAddColumns() {
  try {
    console.log('Checking cities table columns...\n');

    // Check existing columns
    const checkResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cities'
      ORDER BY ordinal_position
    `);

    console.log('Existing columns:');
    checkResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    const existingColumns = checkResult.rows.map(r => r.column_name.toLowerCase());

    // Add missing columns
    const columnsToAdd = [
      { name: 'country_code', type: 'VARCHAR(10)', default: "'SY'" },
      { name: 'address', type: 'VARCHAR(500)' },
      { name: 'latitude', type: 'DECIMAL(10, 8)' },
      { name: 'longitude', type: 'DECIMAL(11, 8)' },
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name.toLowerCase())) {
        try {
          let alterQuery = `ALTER TABLE cities ADD COLUMN ${col.name} ${col.type}`;
          if (col.default) {
            alterQuery += ` DEFAULT ${col.default}`;
          }
          
          await pool.query(alterQuery);
          console.log(`✅ Added column: ${col.name}`);
        } catch (error) {
          console.error(`❌ Error adding column ${col.name}:`, error.message);
        }
      } else {
        console.log(`⏭️  Column already exists: ${col.name}`);
      }
    }

    // Update existing rows to have default country_code if null
    try {
      const updateResult = await pool.query(`
        UPDATE cities 
        SET country_code = 'SY' 
        WHERE country_code IS NULL
      `);
      console.log(`\n✅ Updated ${updateResult.rowCount} cities with default country_code`);
    } catch (error) {
      console.log(`\n⚠️  Could not update country_code: ${error.message}`);
    }

    console.log('\n✅ Cities table check completed!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAndAddColumns();
