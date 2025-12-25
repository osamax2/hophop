// Script to check city names in database and test search matching
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCitiesMatching() {
  try {
    console.log('🔍 Checking city names in database...\n');

    // Get all cities from database
    const citiesResult = await pool.query(`
      SELECT id, name, 
             LENGTH(name) as name_length,
             TRIM(name) as trimmed_name,
             LOWER(name) as lower_name,
             LOWER(TRIM(name)) as lower_trimmed_name
      FROM cities
      ORDER BY name ASC
    `);

    console.log(`📊 Total cities in database: ${citiesResult.rows.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 City Names in Database:\n');

    const cities = citiesResult.rows;
    const cityNames = cities.map(c => c.name);
    
    // Display first 20 cities
    cities.slice(0, 20).forEach((city, index) => {
      const hasSpaces = city.name !== city.trimmed_name;
      const spaceIndicator = hasSpaces ? ' ⚠️ (has spaces)' : '';
      console.log(`${index + 1}. ID: ${city.id} | Name: "${city.name}" | Length: ${city.name_length}${spaceIndicator}`);
    });

    if (cities.length > 20) {
      console.log(`\n... and ${cities.length - 20} more cities\n`);
    }

    // Test search matching
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 Testing Search Matching:\n');

    const testSearches = ['ح', 'حلب', 'دمشق', 'حمص', 'حماة', 'اللاذقية'];
    
    for (const searchTerm of testSearches) {
      console.log(`\n🔎 Searching for: "${searchTerm}"`);
      
      // Test LIKE with starts with (current implementation)
      const startsWithResult = await pool.query(
        `SELECT id, name FROM cities WHERE LOWER(name) LIKE LOWER($1) ORDER BY name LIMIT 10`,
        [`${searchTerm}%`]
      );
      
      console.log(`   ✅ Starts with "${searchTerm}": ${startsWithResult.rows.length} results`);
      if (startsWithResult.rows.length > 0) {
        startsWithResult.rows.slice(0, 5).forEach(city => {
          console.log(`      - ${city.name} (ID: ${city.id})`);
        });
      }

      // Test LIKE with contains (alternative)
      const containsResult = await pool.query(
        `SELECT id, name FROM cities WHERE LOWER(name) LIKE LOWER($1) ORDER BY name LIMIT 10`,
        [`%${searchTerm}%`]
      );
      
      console.log(`   📦 Contains "${searchTerm}": ${containsResult.rows.length} results`);
      if (containsResult.rows.length > 0 && containsResult.rows.length <= 5) {
        containsResult.rows.forEach(city => {
          console.log(`      - ${city.name} (ID: ${city.id})`);
        });
      }
    }

    // Check for cities with leading/trailing spaces
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Checking for cities with spaces:\n');
    
    const citiesWithSpaces = cities.filter(c => c.name !== c.trimmed_name);
    if (citiesWithSpaces.length > 0) {
      console.log(`Found ${citiesWithSpaces.length} cities with leading/trailing spaces:\n`);
      citiesWithSpaces.forEach(city => {
        console.log(`   - "${city.name}" (ID: ${city.id}) | Original length: ${city.name.length} | Trimmed length: ${city.trimmed_name.length}`);
      });
    } else {
      console.log('✅ No cities with leading/trailing spaces found.');
    }

    // Check routes and their city names
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛣️  Checking Routes and City Names:\n');
    
    const routesResult = await pool.query(`
      SELECT r.id as route_id,
             c_from.id as from_city_id,
             c_from.name as from_city_name,
             c_to.id as to_city_id,
             c_to.name as to_city_name,
             COUNT(t.id) as trip_count
      FROM routes r
      JOIN cities c_from ON r.from_city_id = c_from.id
      JOIN cities c_to ON r.to_city_id = c_to.id
      LEFT JOIN trips t ON t.route_id = r.id AND t.is_active = true
      GROUP BY r.id, c_from.id, c_from.name, c_to.id, c_to.name
      ORDER BY trip_count DESC, r.id
      LIMIT 20
    `);

    console.log(`Found ${routesResult.rows.length} routes (showing first 20):\n`);
    routesResult.rows.forEach(route => {
      console.log(`   Route ${route.route_id}: ${route.from_city_name} → ${route.to_city_name} (${route.trip_count} active trips)`);
    });

    // Test actual search query used in API
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔬 Testing Actual API Search Query:\n');
    
    const testFrom = 'حلب';
    const testTo = 'دمشق';
    
    console.log(`Testing search: from="${testFrom}", to="${testTo}"\n`);
    
    const apiQueryResult = await pool.query(`
      SELECT
        t.id,
        t.departure_time,
        t.arrival_time,
        t.is_active,
        c_from.name AS from_city,
        c_to.name   AS to_city,
        COALESCE(comp.name, 'Unknown') AS company_name
      FROM trips t
      JOIN routes r         ON t.route_id = r.id
      JOIN cities c_from    ON r.from_city_id = c_from.id
      JOIN cities c_to      ON r.to_city_id   = c_to.id
      LEFT JOIN transport_companies comp ON t.company_id = comp.id
      WHERE t.is_active = true
        AND LOWER(c_from.name) LIKE LOWER($1)
        AND LOWER(c_to.name) LIKE LOWER($2)
      ORDER BY t.departure_time
      LIMIT 10
    `, [`${testFrom}%`, `${testTo}%`]);
    
    console.log(`Found ${apiQueryResult.rows.length} trips:\n`);
    if (apiQueryResult.rows.length > 0) {
      apiQueryResult.rows.forEach(trip => {
        const depTime = new Date(trip.departure_time).toLocaleString('ar-SY');
        const arrTime = new Date(trip.arrival_time).toLocaleString('ar-SY');
        console.log(`   Trip ${trip.id}: ${trip.from_city} → ${trip.to_city}`);
        console.log(`      Departure: ${depTime} | Arrival: ${arrTime} | Company: ${trip.company_name}`);
      });
    } else {
      console.log('   ⚠️  No trips found! This might indicate a matching problem.');
      
      // Check if cities exist
      const fromCityCheck = await pool.query(
        `SELECT id, name FROM cities WHERE LOWER(name) LIKE LOWER($1)`,
        [`${testFrom}%`]
      );
      const toCityCheck = await pool.query(
        `SELECT id, name FROM cities WHERE LOWER(name) LIKE LOWER($1)`,
        [`${testTo}%`]
      );
      
      console.log(`\n   City checks:`);
      console.log(`   - Cities starting with "${testFrom}": ${fromCityCheck.rows.length}`);
      if (fromCityCheck.rows.length > 0) {
        fromCityCheck.rows.forEach(c => console.log(`      ${c.name} (ID: ${c.id})`));
      }
      console.log(`   - Cities starting with "${testTo}": ${toCityCheck.rows.length}`);
      if (toCityCheck.rows.length > 0) {
        toCityCheck.rows.forEach(c => console.log(`      ${c.name} (ID: ${c.id})`));
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Check completed!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkCitiesMatching();

