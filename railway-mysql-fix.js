// Railway.app MySQL Fix - Handle deployment failures
const { Sequelize } = require('sequelize');

// Railway.app MySQL connection with retry logic
async function createDatabaseConnection() {
    const maxRetries = 10;
    const retryDelay = 2000; // 2 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔗 Attempt ${attempt}/${maxRetries} to connect to MySQL...`);
            
            const sequelize = new Sequelize({
                host: process.env.RAILWAY_PRIVATE_DOMAIN || 'shuttle.proxy.rlwy.net',
                port: process.env.RAILWAY_TCP_PORT || '35740',
                database: process.env.RAILWAY_DB_NAME || 'railway',
                username: process.env.RAILWAY_DB_USERNAME || 'root',
                password: process.env.RAILWAY_DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw',
                dialect: 'mysql',
                logging: attempt === 1 ? console.log : false, // Only log first attempt
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    },
                    connectTimeout: 10000,
                    acquireTimeout: 10000,
                    timeout: 10000
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });
            
            // Test connection
            await sequelize.authenticate();
            console.log('✅ MySQL connection successful!');
            return sequelize;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('❌ All connection attempts failed');
                throw error;
            }
            
            console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

async function setupRailwayDatabase() {
    console.log('🚀 Setting up Railway.app MySQL database...');
    
    let sequelize;
    
    try {
        // Create connection with retry logic
        sequelize = await createDatabaseConnection();
        
        // Create database if it doesn't exist
        console.log('📋 Ensuring database exists...');
        try {
            await sequelize.query('CREATE DATABASE IF NOT EXISTS railway');
            console.log('✅ Database ensured');
        } catch (error) {
            console.log('ℹ️ Database creation failed (might already exist):', error.message);
        }
        
        // Switch to railway database
        await sequelize.query('USE railway');
        
        // Create tables with IF NOT EXISTS to avoid conflicts
        console.log('📋 Creating tables...');
        
        // Users table
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
        console.log('✅ Users table created');
        
        // Vehicles table
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
        console.log('✅ Vehicles table created');
        
        // Drivers table
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
        console.log('✅ Drivers table created');
        
        // Trips table
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
        console.log('✅ Trips table created');
        
        // Maintenance records table
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
        console.log('✅ Maintenance records table created');
        
        // Fuel records table
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
        console.log('✅ Fuel records table created');
        
        // Insert sample data if tables are empty
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
        
        console.log('🎉 Railway.app MySQL setup completed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Railway.app MySQL setup failed:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.original?.code,
            errno: error.original?.errno,
            sqlState: error.original?.sqlState
        });
        return false;
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}

module.exports = { setupRailwayDatabase };
