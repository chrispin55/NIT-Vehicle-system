// Database Initialization Script for Railway.app
const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
    port: process.env.DB_PORT || 35740,
    database: process.env.DB_NAME || 'railway',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw',
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function initializeDatabase() {
    console.log('🚀 Starting database initialization...');
    
    try {
        // Test connection
        console.log('🔗 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        
        // Create tables if they don't exist
        console.log('📋 Creating tables...');
        
        // Import models
        const { User, Vehicle, Driver, Trip, MaintenanceRecord, FuelRecord } = require('./backend/src/models');
        
        // Sync all tables
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ All tables synchronized successfully');
        
        // Check if vehicles table exists and has correct structure
        console.log('🔍 Checking vehicles table structure...');
        const [results] = await sequelize.query("DESCRIBE vehicles");
        console.log('📊 Vehicles table structure:', results);
        
        // Insert sample data if tables are empty
        await insertSampleData();
        
        console.log('🎉 Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

async function insertSampleData() {
    console.log('📝 Checking if sample data is needed...');
    
    try {
        // Check if vehicles table is empty
        const vehicleCount = await sequelize.query('SELECT COUNT(*) as count FROM vehicles');
        const count = vehicleCount[0][0].count;
        
        if (count === 0) {
            console.log('📊 Inserting sample vehicle data...');
            
            await sequelize.query(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES
                ('ABC-123', 'Sedan', 'Toyota Camry', 2022, 'Active'),
                ('XYZ-789', 'Van', 'Ford Transit', 2021, 'Active'),
                ('DEF-456', 'SUV', 'Honda CR-V', 2023, 'Active')
            `);
            
            console.log('✅ Sample vehicle data inserted');
        } else {
            console.log(`📊 Vehicles table already has ${count} records`);
        }
        
        // Check if drivers table is empty
        const driverCount = await sequelize.query('SELECT COUNT(*) as count FROM drivers');
        const driverCountNum = driverCount[0][0].count;
        
        if (driverCountNum === 0) {
            console.log('👤 Inserting sample driver data...');
            
            await sequelize.query(`
                INSERT INTO drivers (name, license_number, phone_number, email, status) VALUES
                ('John Smith', 'DL-001', '+255712345678', 'john@nit.ac.tz', 'Active'),
                ('Mary Johnson', 'DL-002', '+255713456789', 'mary@nit.ac.tz', 'Active'),
                ('David Wilson', 'DL-003', '+255714567890', 'david@nit.ac.tz', 'Active')
            `);
            
            console.log('✅ Sample driver data inserted');
        } else {
            console.log(`👤 Drivers table already has ${driverCountNum} records`);
        }
        
    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        // Don't exit - this is not critical
    }
}

// Run initialization
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
