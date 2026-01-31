// Test Trips Endpoint Debug
// This script will test the trips endpoint and show what's happening

const mysql = require('mysql2/promise');

async function testTripsEndpoint() {
    console.log('🔍 Testing trips endpoint logic...');
    
    const config = {
        host: 'turntable.proxy.rlwy.net',
        port: 12096,
        user: 'root',
        password: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
        database: 'railway',
        charset: 'utf8mb4'
    };
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to Railway database');
        
        // Test basic trips query
        console.log('\n📊 Testing basic trips query...');
        const [basicTrips] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        console.log(`Trips count: ${basicTrips[0].count}`);
        
        // Test the exact query from tripController
        console.log('\n🔍 Testing tripController query...');
        const query = `
          SELECT t.*, 
                 d.full_name as driver_name,
                 v.plate_number as vehicle_plate,
                 v.vehicle_type as vehicle_type
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          JOIN vehicles v ON t.vehicle_id = v.id
          WHERE 1=1
          ORDER BY t.trip_date DESC, t.departure_time DESC LIMIT ? OFFSET ?
        `;
        
        const params = [5, 0];
        console.log('Query:', query);
        console.log('Params:', params);
        
        const [trips] = await connection.execute(query, params);
        console.log(`✅ Query successful! Found ${trips.length} trips`);
        
        if (trips.length > 0) {
            console.log('\n📋 Sample trip data:');
            console.log(JSON.stringify(trips[0], null, 2));
        }
        
        // Test if drivers table has data
        console.log('\n👨‍💼 Checking drivers table...');
        const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        console.log(`Drivers count: ${drivers[0].count}`);
        
        // Test if vehicles table has data
        console.log('\n🚗 Checking vehicles table...');
        const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        console.log(`Vehicles count: ${vehicles[0].count}`);
        
        await connection.end();
        console.log('\n✅ Database test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('🔧 Error details:', error);
        process.exit(1);
    }
}

testTripsEndpoint();
