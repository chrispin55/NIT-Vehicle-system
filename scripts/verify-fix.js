// Verify the Fix Works
// This script tests the exact query that will be used in v1.0.6

const mysql = require('mysql2/promise');

async function verifyFix() {
    console.log('🔍 Verifying the trips query fix...');
    
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
        
        // Test the exact query from the fixed tripController
        console.log('\n🔍 Testing fixed query (v1.0.6)...');
        
        const limit = 5;
        const offset = 0;
        
        let query = `
          SELECT t.*, 
                 d.full_name as driver_name,
                 v.plate_number as vehicle_plate,
                 v.vehicle_type as vehicle_type
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          JOIN vehicles v ON t.vehicle_id = v.id
          WHERE 1=1
        `;
        
        const params = [];
        
        // Fixed: Use hardcoded LIMIT/OFFSET for Railway MySQL compatibility
        query += ` ORDER BY t.trip_date DESC, t.departure_time DESC LIMIT ${limit} OFFSET ${offset}`;
        
        console.log('Query:', query);
        console.log('Params:', params);
        
        const [trips] = await connection.execute(query, params);
        console.log(`✅ Fixed query successful! Found ${trips.length} trips`);
        
        if (trips.length > 0) {
            console.log('\n📋 Sample trip data:');
            console.log(JSON.stringify(trips[0], null, 2));
        }
        
        await connection.end();
        console.log('\n✅ Fix verification completed successfully!');
        console.log('🚀 Railway v1.0.6 should work perfectly with this query!');
        
    } catch (error) {
        console.error('❌ Fix verification failed:', error.message);
        process.exit(1);
    }
}

verifyFix();
