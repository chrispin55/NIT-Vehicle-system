// Fix Database Script - Recreate tables with proper AUTO_INCREMENT
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

async function fixDatabase() {
    console.log('🔧 Starting database fix...');
    
    try {
        // Test connection
        console.log('🔗 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        
        // Drop and recreate tables with correct structure
        console.log('🗑️ Dropping existing tables...');
        
        // Drop tables in correct order (foreign key dependencies)
        await sequelize.query('DROP TABLE IF EXISTS fuel_records');
        await sequelize.query('DROP TABLE IF EXISTS maintenance_records');
        await sequelize.query('DROP TABLE IF EXISTS trips');
        await sequelize.query('DROP TABLE IF EXISTS drivers');
        await sequelize.query('DROP TABLE IF EXISTS vehicles');
        await sequelize.query('DROP TABLE IF EXISTS users');
        
        console.log('✅ Existing tables dropped');
        
        // Recreate tables with correct AUTO_INCREMENT
        console.log('📋 Creating tables with correct structure...');
        
        // Create users table
        await sequelize.query(`
            CREATE TABLE users (
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
            CREATE TABLE vehicles (
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
        
        // Create drivers table with AUTO_INCREMENT
        await sequelize.query(`
            CREATE TABLE drivers (
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
        
        // Create trips table with AUTO_INCREMENT
        await sequelize.query(`
            CREATE TABLE trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT,
                driver_id INT,
                trip_date DATE NOT NULL,
                destination VARCHAR(200) NOT NULL,
                purpose TEXT,
                status ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
                FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
            )
        `);
        
        // Create maintenance_records table with AUTO_INCREMENT
        await sequelize.query(`
            CREATE TABLE maintenance_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                service_date DATE NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                cost DECIMAL(10,2),
                next_service_date DATE,
                notes TEXT,
                status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            )
        `);
        
        // Create fuel_records table with AUTO_INCREMENT
        await sequelize.query(`
            CREATE TABLE fuel_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                fuel_date DATE NOT NULL,
                fuel_type VARCHAR(50) DEFAULT 'Petrol',
                quantity DECIMAL(8,2) NOT NULL,
                cost_per_liter DECIMAL(8,2) NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                odometer_reading INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            )
        `);
        
        console.log('✅ All tables created with correct AUTO_INCREMENT');
        
        // Verify table structure
        console.log('🔍 Verifying table structure...');
        
        const [vehicleStructure] = await sequelize.query('DESCRIBE vehicles');
        const [driverStructure] = await sequelize.query('DESCRIBE drivers');
        
        console.log('📊 Vehicles table structure:', vehicleStructure);
        console.log('👤 Drivers table structure:', driverStructure);
        
        // Insert sample data
        console.log('📝 Inserting sample data...');
        
        await sequelize.query(`
            INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES
            ('ABC-123', 'Sedan', 'Toyota Camry', 2022, 'Active'),
            ('XYZ-789', 'Van', 'Ford Transit', 2021, 'Active'),
            ('DEF-456', 'SUV', 'Honda CR-V', 2023, 'Active')
        `);
        
        await sequelize.query(`
            INSERT INTO drivers (name, license_number, phone_number, email, status) VALUES
            ('John Smith', 'DL-001', '+255712345678', 'john@nit.ac.tz', 'Active'),
            ('Mary Johnson', 'DL-002', '+255713456789', 'mary@nit.ac.tz', 'Active'),
            ('David Wilson', 'DL-003', '+255714567890', 'david@nit.ac.tz', 'Active')
        `);
        
        console.log('✅ Sample data inserted successfully');
        
        // Test vehicle creation
        console.log('🧪 Testing vehicle creation...');
        const [testResult] = await sequelize.query(`
            INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) 
            VALUES ('TEST-999', 'Sedan', 'Test Vehicle', 2024, 'Active')
        `);
        
        console.log('✅ Test vehicle created successfully, ID:', testResult.insertId);
        
        // Clean up test data
        await sequelize.query('DELETE FROM vehicles WHERE plate_number = "TEST-999"');
        
        console.log('🎉 Database fix completed successfully!');
        console.log('✅ All tables now have proper AUTO_INCREMENT for ID fields');
        
    } catch (error) {
        console.error('❌ Database fix failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the fix
if (require.main === module) {
    fixDatabase();
}

module.exports = { fixDatabase };
