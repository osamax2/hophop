// Script to check routes and their city names
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkRoutes() {
  try {
    console.log('🔍 Checking Routes and City Names...\n');

    // Get all routes with their city names
    const routesResult = await pool.query(`
      SELECT 
        r.id as route_id,
        c_from.id as from_city_id,
        c_from.name as from_city_name,
        c_to.id as to_city_id,
        c_to.name as to_city_name,
        COUNT(t.id) as active_trips_count
      FROM routes r
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      LEFT JOIN trips t ON t.route_id = r.id AND t.is_active = true
      GROUP BY r.id, c_from.id, c_from.name, c_to.id, c_to.name
      ORDER BY active_trips_count DESC, r.id
    `);

    console.log(`📊 Total routes: ${routesResult.rows.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛣️  Routes:\n');

    routesResult.rows.forEach(route => {
      const fromIsArabic = /[\u0600-\u06FF]/.test(route.from_city_name);
      const toIsArabic = /[\u0600-\u06FF]/.test(route.to_city_name);
      const fromLang = fromIsArabic ? '🇸🇾 عربي' : '🇬🇧 English';
      const toLang = toIsArabic ? '🇸🇾 عربي' : '🇬🇧 English';
      
      console.log(`Route ${route.route_id}:`);
      console.log(`   From: ${route.from_city_name} (ID: ${route.from_city_id}) ${fromLang}`);
      console.log(`   To:   ${route.to_city_name} (ID: ${route.to_city_id}) ${toLang}`);
      console.log(`   Active trips: ${route.active_trips_count}`);
      console.log('');
    });

    // Check for trips with their routes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚌 Active Trips:\n');

    const tripsResult = await pool.query(`
      SELECT 
        t.id as trip_id,
        t.is_active,
        r.id as route_id,
        c_from.name as from_city,
        c_to.name as to_city,
        t.departure_time,
        COALESCE(comp.name, 'Unknown') as company_name
      FROM trips t
      JOIN routes r ON t.route_id = r.id
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      WHERE t.is_active = true
      ORDER BY t.departure_time
      LIMIT 20
    `);

    console.log(`Found ${tripsResult.rows.length} active trips (showing first 20):\n`);
    tripsResult.rows.forEach(trip => {
      const depTime = new Date(trip.departure_time).toLocaleString('ar-SY');
      console.log(`Trip ${trip.trip_id} (Route ${trip.route_id}):`);
      console.log(`   ${trip.from_city} → ${trip.to_city}`);
      console.log(`   Departure: ${depTime} | Company: ${trip.company_name}`);
      console.log('');
    });

    // Check city name matching
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 City Name Matching Test:\n');

    const testCases = [
      { from: 'حلب', to: 'دمشق' },
      { from: 'Aleppo', to: 'Damascus' },
      { from: 'Damascus', to: 'Homs' },
    ];

    for (const test of testCases) {
      console.log(`Testing: from="${test.from}", to="${test.to}"`);
      
      const searchResult = await pool.query(`
        SELECT
          t.id,
          c_from.name AS from_city,
          c_to.name AS to_city
        FROM trips t
        JOIN routes r ON t.route_id = r.id
        JOIN cities c_from ON r.from_city_id = c_from.id
        JOIN cities c_to ON r.to_city_id = c_to.id
        WHERE t.is_active = true
          AND LOWER(c_from.name) LIKE LOWER($1)
          AND LOWER(c_to.name) LIKE LOWER($2)
        LIMIT 5
      `, [`${test.from}%`, `${test.to}%`]);

      console.log(`   Found ${searchResult.rows.length} trips`);
      if (searchResult.rows.length > 0) {
        searchResult.rows.forEach(t => {
          console.log(`   - Trip ${t.id}: ${t.from_city} → ${t.to_city}`);
        });
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Check completed!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkRoutes();

