// Add Sample Data to Fix Empty Tables
// This script will add sample data to make the system work

const mysql = require('mysql2/promise');

async function addSampleData() {
    console.log('📝 Adding sample data to fix empty tables...');
    
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
        
        // Check current data
        const [vehicleCount] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        const [driverCount] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        const [tripCount] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        
        console.log(`📊 Current data: Vehicles: ${vehicleCount[0].count}, Drivers: ${driverCount[0].count}, Trips: ${tripCount[0].count}`);
        
        // Add sample drivers if empty
        if (driverCount[0].count === 0) {
            console.log('👨‍💼 Adding sample drivers...');
            await connection.execute(`
                INSERT INTO drivers (full_name, license_number, phone_number, email, experience_years, license_expiry, status) VALUES
                ('John Mwambene', 'DL-123456', '255-789-456123', 'john@nit.ac.tz', 5, '2025-12-31', 'Active'),
                ('Grace Joseph', 'DL-789012', '255-756-789012', 'grace@nit.ac.tz', 3, '2025-08-15', 'Active'),
                ('Michael Kimaro', 'DL-345678', '255-712-345678', 'michael@nit.ac.tz', 7, '2026-01-15', 'Active')
            `);
            console.log('✅ Sample drivers added');
        }
        
        // Add sample vehicles if empty
        if (vehicleCount[0].count === 0) {
            console.log('🚗 Adding sample vehicles...');
            await connection.execute(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, capacity, status, fuel_type, next_maintenance_date) VALUES
                ('T 123 ABC', 'Bus', 'Toyota Coaster', 2020, 30, 'Active', 'Diesel', '2026-02-15'),
                ('T 456 DEF', 'Minibus', 'Toyota Hiace', 2021, 15, 'Active', 'Diesel', '2026-03-01'),
                ('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2019, 7, 'Active', 'Petrol', '2026-02-20')
            `);
            console.log('✅ Sample vehicles added');
        }
        
        // Add sample trips if empty
        if (tripCount[0].count === 0) {
            console.log('🛣️ Adding sample trips...');
            await connection.execute(`
                INSERT INTO trips (route_from, route_to, driver_id, vehicle_id, trip_date, departure_time, arrival_time, distance_km, fuel_consumed, passenger_count, notes, status) VALUES
                ('NIT Campus', 'City Center', 1, 1, '2026-01-31', '08:00', '09:30', 25.5, 8.2, 15, 'Regular trip', 'Completed'),
                ('City Center', 'NIT Campus', 2, 2, '2026-01-31', '17:30', '18:45', 25.5, 7.8, 12, 'Return trip', 'Completed'),
                ('NIT Campus', 'Airport', 3, 3, '2026-02-01', '06:00', '07:30', 45.0, 12.5, 8, 'Airport transfer', 'Scheduled')
            `);
            console.log('✅ Sample trips added');
        }
        
        // Verify final data
        const [finalVehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        const [finalDrivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        const [finalTrips] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        
        console.log('\n📊 Final data counts:');
        console.log(`   Vehicles: ${finalVehicles[0].count}`);
        console.log(`   Drivers: ${finalDrivers[0].count}`);
        console.log(`   Trips: ${finalTrips[0].count}`);
        
        // Test the trips query again
        console.log('\n🔍 Testing trips query with data...');
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
        
        const [testTrips] = await connection.execute(query, [5, 0]);
        console.log(`✅ Query successful! Found ${testTrips.length} trips`);
        
        if (testTrips.length > 0) {
            console.log('\n📋 Sample trip:');
            console.log(JSON.stringify(testTrips[0], null, 2));
        }
        
        await connection.end();
        console.log('\n✅ Sample data added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding sample data:', error.message);
        process.exit(1);
    }
}

addSampleData();
