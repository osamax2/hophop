// Script to insert all Syrian cities into the database
// Run: cd backend && node insert_syrian_cities.js

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Comprehensive list of Syrian cities with coordinates
const syrianCities = [
  // Governorate Capitals (14 governorates)
  { name: 'دمشق', country_code: 'SY', lat: 33.5138, lng: 36.2765 },
  { name: 'حلب', country_code: 'SY', lat: 36.2021, lng: 37.1343 },
  { name: 'حمص', country_code: 'SY', lat: 34.7268, lng: 36.7234 },
  { name: 'اللاذقية', country_code: 'SY', lat: 35.5138, lng: 35.7794 },
  { name: 'طرطوس', country_code: 'SY', lat: 34.8886, lng: 35.8864 },
  { name: 'دير الزور', country_code: 'SY', lat: 35.3354, lng: 40.1408 },
  { name: 'الحسكة', country_code: 'SY', lat: 36.5047, lng: 40.7489 },
  { name: 'الرقة', country_code: 'SY', lat: 35.9506, lng: 39.0094 },
  { name: 'السويداء', country_code: 'SY', lat: 32.7089, lng: 36.5694 },
  { name: 'درعا', country_code: 'SY', lat: 32.6189, lng: 36.1019 },
  { name: 'إدلب', country_code: 'SY', lat: 35.9333, lng: 36.6333 },
  { name: 'حماة', country_code: 'SY', lat: 35.1318, lng: 36.7578 },
  { name: 'القنيطرة', country_code: 'SY', lat: 33.1239, lng: 35.8244 },
  { name: 'دوما', country_code: 'SY', lat: 33.5711, lng: 36.4028 },

  // Major Cities in Damascus Governorate (Rif Dimashq)
  { name: 'داريا', country_code: 'SY', lat: 33.4581, lng: 36.2322 },
  { name: 'السيدة زينب', country_code: 'SY', lat: 33.4444, lng: 36.3361 },
  { name: 'التل', country_code: 'SY', lat: 33.6000, lng: 36.3000 },
  { name: 'الزبداني', country_code: 'SY', lat: 33.7167, lng: 36.1000 },
  { name: 'قطنا', country_code: 'SY', lat: 33.4333, lng: 36.1167 },
  { name: 'يبرود', country_code: 'SY', lat: 33.9667, lng: 36.6667 },
  { name: 'النبك', country_code: 'SY', lat: 34.0167, lng: 36.7333 },
  { name: 'الزاهرة', country_code: 'SY', lat: 33.5167, lng: 36.3000 },
  { name: 'برزة', country_code: 'SY', lat: 33.5167, lng: 36.2833 },
  { name: 'كفر سوسة', country_code: 'SY', lat: 33.5000, lng: 36.2833 },
  { name: 'المزة', country_code: 'SY', lat: 33.4833, lng: 36.2500 },
  { name: 'جوبر', country_code: 'SY', lat: 33.5333, lng: 36.3333 },
  { name: 'القدم', country_code: 'SY', lat: 33.4667, lng: 36.3000 },
  { name: 'الميدان', country_code: 'SY', lat: 33.4500, lng: 36.3167 },
  { name: 'الصالحية', country_code: 'SY', lat: 33.4833, lng: 36.3167 },
  { name: 'باب توما', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'باب شرقي', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'الشارع المستقيم', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'سوق الحميدية', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'المرجة', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'العباسيين', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'الركن الشمالي', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'الركن الجنوبي', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'العدوي', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'القدس', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'الزهراء', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'الروضة', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'المالكي', country_code: 'SY', lat: 33.5167, lng: 36.3167 },
  { name: 'أبو رمانة', country_code: 'SY', lat: 33.5167, lng: 36.3167 },

  // Major Cities in Aleppo Governorate
  { name: 'منبج', country_code: 'SY', lat: 36.5281, lng: 37.9550 },
  { name: 'الباب', country_code: 'SY', lat: 36.3706, lng: 37.5158 },
  { name: 'عفرين', country_code: 'SY', lat: 36.5114, lng: 36.8664 },
  { name: 'إعزاز', country_code: 'SY', lat: 36.5861, lng: 37.0444 },
  { name: 'السفيرة', country_code: 'SY', lat: 36.0667, lng: 37.3667 },
  { name: 'تل رفعت', country_code: 'SY', lat: 36.4667, lng: 37.1000 },
  { name: 'جبل سمعان', country_code: 'SY', lat: 36.2000, lng: 37.1333 },
  { name: 'عندان', country_code: 'SY', lat: 36.3000, lng: 37.0500 },
  { name: 'نبل', country_code: 'SY', lat: 36.3667, lng: 37.0167 },
  { name: 'السريان', country_code: 'SY', lat: 36.1833, lng: 37.1667 },

  // Major Cities in Homs Governorate
  { name: 'تدمر', country_code: 'SY', lat: 34.5581, lng: 38.2739 },
  { name: 'الرستن', country_code: 'SY', lat: 34.9333, lng: 36.7333 },
  { name: 'تلكلخ', country_code: 'SY', lat: 34.6667, lng: 36.2500 },
  { name: 'مصياف', country_code: 'SY', lat: 35.0667, lng: 36.3500 },
  { name: 'شين', country_code: 'SY', lat: 34.7833, lng: 36.4667 },
  { name: 'القصير', country_code: 'SY', lat: 34.5167, lng: 36.5833 },
  { name: 'القدموس', country_code: 'SY', lat: 34.9167, lng: 36.1167 },
  { name: 'تادمور', country_code: 'SY', lat: 34.5581, lng: 38.2739 },

  // Major Cities in Latakia Governorate
  { name: 'جبلة', country_code: 'SY', lat: 35.3667, lng: 35.9333 },
  { name: 'بانياس', country_code: 'SY', lat: 35.1833, lng: 35.9500 },
  { name: 'صافيتا', country_code: 'SY', lat: 34.8167, lng: 36.1167 },
  { name: 'الحفة', country_code: 'SY', lat: 35.6000, lng: 36.0333 },
  { name: 'قرداحة', country_code: 'SY', lat: 35.4500, lng: 36.0000 },
  { name: 'كسب', country_code: 'SY', lat: 35.9167, lng: 36.1167 },

  // Major Cities in Tartus Governorate
  { name: 'الدريكيش', country_code: 'SY', lat: 34.9000, lng: 36.1167 },
  { name: 'الشيخ بدر', country_code: 'SY', lat: 34.8333, lng: 36.0500 },

  // Major Cities in Deir ez-Zor Governorate
  { name: 'البوكمال', country_code: 'SY', lat: 34.4500, lng: 40.9167 },
  { name: 'الميادين', country_code: 'SY', lat: 34.4500, lng: 40.7833 },
  { name: 'أبو كمال', country_code: 'SY', lat: 34.4500, lng: 40.9167 },

  // Major Cities in Al-Hasakah Governorate
  { name: 'القامشلي', country_code: 'SY', lat: 37.0511, lng: 41.2294 },
  { name: 'رأس العين', country_code: 'SY', lat: 36.8500, lng: 40.0667 },
  { name: 'المالكية', country_code: 'SY', lat: 37.1667, lng: 42.1333 },
  { name: 'عامودا', country_code: 'SY', lat: 37.0000, lng: 41.0167 },
  { name: 'ديريك', country_code: 'SY', lat: 37.0500, lng: 42.2000 },
  { name: 'تل تمر', country_code: 'SY', lat: 36.6500, lng: 40.3667 },
  { name: 'شددي', country_code: 'SY', lat: 36.8167, lng: 40.5167 },

  // Major Cities in Raqqa Governorate
  { name: 'عين العرب', country_code: 'SY', lat: 36.8167, lng: 38.0167 },
  { name: 'الطبقة', country_code: 'SY', lat: 35.8333, lng: 38.5500 },

  // Major Cities in As-Suwayda Governorate
  { name: 'شهبا', country_code: 'SY', lat: 32.8500, lng: 36.5667 },
  { name: 'صلخد', country_code: 'SY', lat: 32.4833, lng: 36.7167 },

  // Major Cities in Daraa Governorate
  { name: 'بصرى', country_code: 'SY', lat: 32.5167, lng: 36.4833 },
  { name: 'إزرع', country_code: 'SY', lat: 32.8667, lng: 36.2500 },
  { name: 'نوى', country_code: 'SY', lat: 32.8833, lng: 36.0333 },
  { name: 'طفس', country_code: 'SY', lat: 32.7333, lng: 36.0667 },
  { name: 'الشيخ مسكين', country_code: 'SY', lat: 32.8167, lng: 36.1500 },
  { name: 'جاسم', country_code: 'SY', lat: 32.7833, lng: 36.0500 },
  { name: 'إنخل', country_code: 'SY', lat: 32.7500, lng: 36.0167 },
  { name: 'داعل', country_code: 'SY', lat: 32.8167, lng: 36.0833 },

  // Major Cities in Idlib Governorate
  { name: 'معرة النعمان', country_code: 'SY', lat: 35.6333, lng: 36.6833 },
  { name: 'جسر الشغور', country_code: 'SY', lat: 35.8167, lng: 36.3167 },
  { name: 'أريحا', country_code: 'SY', lat: 35.8167, lng: 36.6000 },
  { name: 'كفر تخاريم', country_code: 'SY', lat: 36.1167, lng: 36.5167 },
  { name: 'حارم', country_code: 'SY', lat: 36.2000, lng: 36.5167 },
  { name: 'سرمين', country_code: 'SY', lat: 35.8667, lng: 36.7167 },
  { name: 'بينش', country_code: 'SY', lat: 35.8167, lng: 36.6333 },
  { name: 'الدانا', country_code: 'SY', lat: 35.7667, lng: 36.7833 },

  // Major Cities in Hama Governorate
  { name: 'السلمية', country_code: 'SY', lat: 35.0167, lng: 37.0500 },
  { name: 'محردة', country_code: 'SY', lat: 35.2500, lng: 36.5667 },
  { name: 'كفر زيتا', country_code: 'SY', lat: 35.1167, lng: 36.6000 },
  { name: 'اللطامنة', country_code: 'SY', lat: 35.0833, lng: 36.5000 },
  { name: 'مورك', country_code: 'SY', lat: 35.2000, lng: 36.6833 },
  { name: 'كفر نبودة', country_code: 'SY', lat: 35.1333, lng: 36.5500 },
];

async function insertSyrianCities() {
  try {
    console.log('🌍 Inserting Syrian cities into database...\n');

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Check if name column has unique constraint
    let hasUniqueConstraint = false;
    try {
      const constraintCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'cities' 
          AND ccu.column_name = 'name'
          AND tc.constraint_type = 'UNIQUE'
      `);
      hasUniqueConstraint = parseInt(constraintCheck.rows[0].count) > 0;
    } catch (e) {
      console.log('⚠️  Could not check for unique constraint, proceeding anyway...');
    }

    for (const city of syrianCities) {
      try {
        let query, params;
        
        if (hasUniqueConstraint) {
          // Use ON CONFLICT if unique constraint exists
          query = `
            INSERT INTO cities (name, country_code, latitude, longitude)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
          `;
        } else {
          // Check if city exists first, then insert
          const exists = await pool.query(
            'SELECT id FROM cities WHERE name = $1',
            [city.name]
          );
          
          if (exists.rows.length > 0) {
            skipped++;
            console.log(`⏭️  Skipped (already exists): ${city.name}`);
            continue;
          }
          
          query = `
            INSERT INTO cities (name, country_code, latitude, longitude)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;
        }
        
        params = [city.name, city.country_code, city.lat, city.lng];
        const result = await pool.query(query, params);

        if (result.rows.length > 0) {
          inserted++;
          console.log(`✅ Inserted: ${city.name}`);
        } else if (hasUniqueConstraint) {
          skipped++;
          console.log(`⏭️  Skipped (already exists): ${city.name}`);
        }
      } catch (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          skipped++;
          console.log(`⏭️  Skipped (duplicate): ${city.name}`);
        } else {
          errors++;
          console.error(`❌ Error inserting ${city.name}:`, error.message);
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   ✅ Inserted: ${inserted} cities`);
    console.log(`   ⏭️  Skipped (already exist): ${skipped} cities`);
    console.log(`   ❌ Errors: ${errors} cities`);
    console.log(`   📍 Total processed: ${syrianCities.length} cities`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show total cities in database
    const countResult = await pool.query('SELECT COUNT(*) as total FROM cities');
    console.log(`📈 Total cities in database: ${countResult.rows[0].total}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

insertSyrianCities();
