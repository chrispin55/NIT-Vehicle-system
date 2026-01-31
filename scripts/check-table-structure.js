// Check Table Structure and Fix Query
// This script will check the actual table structure and fix the query

const mysql = require('mysql2/promise');

async function checkAndFixQuery() {
    console.log('🔍 Checking table structure and fixing query...');
    
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
        
        // Check trips table structure
        console.log('\n📊 Trips table structure:');
        const [tripsColumns] = await connection.execute('DESCRIBE trips');
        tripsColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
        });
        
        // Check drivers table structure
        console.log('\n👨‍💼 Drivers table structure:');
        const [driversColumns] = await connection.execute('DESCRIBE drivers');
        driversColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
        });
        
        // Check vehicles table structure
        console.log('\n🚗 Vehicles table structure:');
        const [vehiclesColumns] = await connection.execute('DESCRIBE vehicles');
        vehiclesColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
        });
        
        // Test a simpler query first
        console.log('\n🔍 Testing simple trips query...');
        const [simpleTrips] = await connection.execute('SELECT * FROM trips LIMIT 5');
        console.log(`✅ Simple query successful! Found ${simpleTrips.length} trips`);
        
        if (simpleTrips.length > 0) {
            console.log('\n📋 Sample trip data:');
            console.log(JSON.stringify(simpleTrips[0], null, 2));
        }
        
        // Test the join query step by step
        console.log('\n🔍 Testing join with drivers only...');
        const [driverJoin] = await connection.execute(`
          SELECT t.*, d.full_name as driver_name
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          LIMIT 3
        `);
        console.log(`✅ Driver join successful! Found ${driverJoin.length} trips`);
        
        console.log('\n🔍 Testing full join query...');
        const [fullJoin] = await connection.execute(`
          SELECT t.*, 
                 d.full_name as driver_name,
                 v.plate_number as vehicle_plate,
                 v.vehicle_type as vehicle_type
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          JOIN vehicles v ON t.vehicle_id = v.id
          LIMIT 3
        `);
        console.log(`✅ Full join successful! Found ${fullJoin.length} trips`);
        
        if (fullJoin.length > 0) {
            console.log('\n📋 Sample joined trip data:');
            console.log(JSON.stringify(fullJoin[0], null, 2));
        }
        
        // Test the problematic query with parameters
        console.log('\n🔍 Testing query with LIMIT and OFFSET...');
        const [paramQuery] = await connection.execute(`
          SELECT t.*, 
                 d.full_name as driver_name,
                 v.plate_number as vehicle_plate,
                 v.vehicle_type as vehicle_type
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          JOIN vehicles v ON t.vehicle_id = v.id
          ORDER BY t.trip_date DESC, t.departure_time DESC 
          LIMIT 5 OFFSET 0
        `);
        console.log(`✅ Parameter query successful! Found ${paramQuery.length} trips`);
        
        await connection.end();
        console.log('\n✅ Query testing completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing query:', error.message);
        console.error('🔧 Error details:', error);
        process.exit(1);
    }
}

checkAndFixQuery();
