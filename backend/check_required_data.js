// Script to check if all required data exists for adding trips
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkRequiredData() {
  try {
    console.log('🔍 Checking required data for adding trips...\n');

    // Check cities
    const citiesResult = await pool.query(`
      SELECT COUNT(*) as count FROM cities
    `);
    const citiesCount = parseInt(citiesResult.rows[0].count);
    console.log(`📊 Cities: ${citiesCount} cities found`);
    
    if (citiesCount > 0) {
      const sampleCities = await pool.query(`
        SELECT id, name FROM cities ORDER BY name LIMIT 10
      `);
      console.log('   Sample cities:');
      sampleCities.rows.forEach(city => {
        console.log(`   - ${city.name} (ID: ${city.id})`);
      });
    } else {
      console.log('   ⚠️  No cities found! You need to add cities first.');
    }

    // Check companies
    const companiesResult = await pool.query(`
      SELECT COUNT(*) as count FROM transport_companies
    `);
    const companiesCount = parseInt(companiesResult.rows[0].count);
    console.log(`\n🚌 Companies: ${companiesCount} companies found`);
    
    if (companiesCount > 0) {
      const companies = await pool.query(`
        SELECT id, name FROM transport_companies ORDER BY name
      `);
      console.log('   Companies:');
      companies.rows.forEach(company => {
        console.log(`   - ${company.name} (ID: ${company.id})`);
      });
    } else {
      console.log('   ⚠️  No companies found! You need to add companies first.');
    }

    // Check transport types
    const transportTypesResult = await pool.query(`
      SELECT COUNT(*) as count FROM transport_types
    `);
    const transportTypesCount = parseInt(transportTypesResult.rows[0].count);
    console.log(`\n🚗 Transport Types: ${transportTypesCount} types found`);
    
    if (transportTypesCount > 0) {
      const transportTypes = await pool.query(`
        SELECT id, label, code FROM transport_types ORDER BY label
      `);
      console.log('   Transport types:');
      transportTypes.rows.forEach(type => {
        console.log(`   - ${type.label || type.code} (ID: ${type.id}, Code: ${type.code})`);
      });
    } else {
      console.log('   ⚠️  No transport types found! You need to add transport types first.');
    }

    // Check stations
    const stationsResult = await pool.query(`
      SELECT COUNT(*) as count FROM stations
    `);
    const stationsCount = parseInt(stationsResult.rows[0].count);
    console.log(`\n🚉 Stations: ${stationsCount} stations found`);
    
    if (stationsCount > 0) {
      const stations = await pool.query(`
        SELECT s.id, s.name, c.name as city_name
        FROM stations s
        LEFT JOIN cities c ON s.city_id = c.id
        ORDER BY c.name, s.name
        LIMIT 10
      `);
      console.log('   Sample stations:');
      stations.rows.forEach(station => {
        console.log(`   - ${station.city_name || 'Unknown'} - ${station.name} (ID: ${station.id})`);
      });
      if (stationsCount > 10) {
        console.log(`   ... and ${stationsCount - 10} more stations`);
      }
    } else {
      console.log('   ⚠️  No stations found! You need to add stations first.');
    }

    // Check routes
    const routesResult = await pool.query(`
      SELECT COUNT(*) as count FROM routes
    `);
    const routesCount = parseInt(routesResult.rows[0].count);
    console.log(`\n🛣️  Routes: ${routesCount} routes found`);
    
    if (routesCount > 0) {
      const routes = await pool.query(`
        SELECT r.id, c_from.name as from_city, c_to.name as to_city
        FROM routes r
        JOIN cities c_from ON r.from_city_id = c_from.id
        JOIN cities c_to ON r.to_city_id = c_to.id
        ORDER BY r.id
        LIMIT 10
      `);
      console.log('   Sample routes:');
      routes.rows.forEach(route => {
        console.log(`   - Route ${route.id}: ${route.from_city} → ${route.to_city}`);
      });
      if (routesCount > 10) {
        console.log(`   ... and ${routesCount - 10} more routes`);
      }
    } else {
      console.log('   ⚠️  No routes found! Routes will be created automatically when adding trips.');
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Summary:\n');
    
    const allDataExists = citiesCount > 0 && companiesCount > 0 && transportTypesCount > 0 && stationsCount > 0;
    
    if (allDataExists) {
      console.log('✅ All required data exists! You can add trips now.');
    } else {
      console.log('⚠️  Missing required data:');
      if (citiesCount === 0) console.log('   - Cities');
      if (companiesCount === 0) console.log('   - Companies');
      if (transportTypesCount === 0) console.log('   - Transport Types');
      if (stationsCount === 0) console.log('   - Stations');
      console.log('\n   Please add the missing data before adding trips.');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Check completed!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkRequiredData();

