// Persistent Database Setup - Auto-recreate tables on Railway.app restarts
const { Sequelize } = require('sequelize');

// Database connection with your exact environment variables
const sequelize = new Sequelize({
    host: "shuttle.proxy.rlwy.net",
    port: "35740",
    database: "railway",
    username: "root",
    password: "FYeDxMGArZDXDqBTYUivUysJiAbGqKtw",
    dialect: "mysql",
    logging: false, // Reduce log noise in production
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function setupPersistentDatabase() {
    console.log('🔧 Setting up persistent database...');
    
    try {
        // Test connection
        console.log('🔗 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Create tables if they don't exist with correct structure
        console.log('📋 Ensuring tables exist with correct structure...');
        
        // Create users table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create vehicles table with AUTO_INCREMENT
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plate_number VARCHAR(20) UNIQUE NOT NULL,
                vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
                model VARCHAR(100) NOT NULL,
                manufacture_year INT NOT NULL,
                status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create drivers table with correct field names
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS drivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                license_number VARCHAR(50) UNIQUE NOT NULL,
                phone_number VARCHAR(20),
                email VARCHAR(100),
                status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create trips table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT,
                driver_id INT,
                trip_date DATE NOT NULL,
                destination VARCHAR(200) NOT NULL,
                purpose TEXT,
                status ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create maintenance records table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS maintenance_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                service_date DATE NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                cost DECIMAL(10,2),
                next_service_date DATE,
                notes TEXT,
                status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create fuel records table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS fuel_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                fuel_date DATE NOT NULL,
                fuel_type VARCHAR(50) DEFAULT 'Petrol',
                quantity DECIMAL(8,2) NOT NULL,
                cost_per_liter DECIMAL(8,2) NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                odometer_reading INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tables ensured');
        
        // Check if sample data exists, insert if empty
        console.log('📝 Checking sample data...');
        
        const [vehicleCount] = await sequelize.query('SELECT COUNT(*) as count FROM vehicles');
        const [driverCount] = await sequelize.query('SELECT COUNT(*) as count FROM drivers');
        
        if (vehicleCount[0].count === 0) {
            console.log('📊 Inserting sample vehicles...');
            await sequelize.query(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES
                ('ABC-123', 'Sedan', 'Toyota Camry', 2022, 'Active'),
                ('XYZ-789', 'Van', 'Ford Transit', 2021, 'Active'),
                ('DEF-456', 'SUV', 'Honda CR-V', 2023, 'Active')
            `);
            console.log('✅ Sample vehicles inserted');
        } else {
            console.log(`📊 Vehicles: ${vehicleCount[0].count} records`);
        }
        
        if (driverCount[0].count === 0) {
            console.log('👤 Inserting sample drivers...');
            await sequelize.query(`
                INSERT INTO drivers (name, license_number, phone_number, email, status) VALUES
                ('John Smith', 'DL-001', '+255712345678', 'john@nit.ac.tz', 'Active'),
                ('Mary Johnson', 'DL-002', '+255713456789', 'mary@nit.ac.tz', 'Active'),
                ('David Wilson', 'DL-003', '+255714567890', 'david@nit.ac.tz', 'Active')
            `);
            console.log('✅ Sample drivers inserted');
        } else {
            console.log(`👤 Drivers: ${driverCount[0].count} records`);
        }
        
        console.log('✅ Persistent database setup complete');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        // Don't exit - let the server start anyway
    } finally {
        await sequelize.close();
    }
}

module.exports = { setupPersistentDatabase };
