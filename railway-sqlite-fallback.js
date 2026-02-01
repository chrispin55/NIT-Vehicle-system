// Railway.app SQLite Fallback - Works even if MySQL fails
const { Sequelize } = require('sequelize');
const path = require('path');

// Try MySQL first, fallback to SQLite
async function createDatabaseConnection() {
    console.log('🔗 Attempting database connection...');
    
    // First try MySQL (Railway.app)
    try {
        console.log('🐬 Trying MySQL connection...');
        
        const mysqlSequelize = new Sequelize({
            host: process.env.RAILWAY_PRIVATE_DOMAIN || 'shuttle.proxy.rlwy.net',
            port: process.env.RAILWAY_TCP_PORT || '35740',
            database: process.env.RAILWAY_DB_NAME || 'railway',
            username: process.env.RAILWAY_DB_USERNAME || 'root',
            password: process.env.RAILWAY_DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw',
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        });
        
        await mysqlSequelize.authenticate();
        console.log('✅ MySQL connection successful!');
        return { sequelize: mysqlSequelize, type: 'mysql' };
        
    } catch (mysqlError) {
        console.log('❌ MySQL failed, falling back to SQLite:', mysqlError.message);
        
        // Fallback to SQLite
        try {
            console.log('🗄️ Using SQLite fallback...');
            
            const sqliteSequelize = new Sequelize({
                dialect: 'sqlite',
                storage: path.join(__dirname, 'database.sqlite'),
                logging: false
            });
            
            await sqliteSequelize.authenticate();
            console.log('✅ SQLite connection successful!');
            return { sequelize: sqliteSequelize, type: 'sqlite' };
            
        } catch (sqliteError) {
            console.error('❌ Both MySQL and SQLite failed!');
            throw new Error('No database connection available');
        }
    }
}

async function setupDatabase() {
    console.log('🚀 Setting up database (MySQL with SQLite fallback)...');
    
    let sequelize, dbType;
    
    try {
        // Get database connection
        const connection = await createDatabaseConnection();
        sequelize = connection.sequelize;
        dbType = connection.type;
        
        console.log(`📋 Using ${dbType.toUpperCase()} database`);
        
        // Create tables
        console.log('📋 Creating tables...');
        
        // Users table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'staff',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Vehicles table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                plate_number VARCHAR(20) UNIQUE NOT NULL,
                vehicle_type VARCHAR(20) NOT NULL,
                model VARCHAR(100) NOT NULL,
                manufacture_year INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'Active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Drivers table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS drivers (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                name VARCHAR(100) NOT NULL,
                license_number VARCHAR(50) UNIQUE NOT NULL,
                phone_number VARCHAR(20),
                email VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Trips table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                vehicle_id INTEGER,
                driver_id INTEGER,
                trip_date DATE NOT NULL,
                destination VARCHAR(200) NOT NULL,
                purpose TEXT,
                status VARCHAR(20) DEFAULT 'Scheduled',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Maintenance records table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS maintenance_records (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                vehicle_id INTEGER NOT NULL,
                service_date DATE NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                cost DECIMAL(10,2),
                next_service_date DATE,
                notes TEXT,
                status VARCHAR(20) DEFAULT 'Scheduled',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Fuel records table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS fuel_records (
                id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
                vehicle_id INTEGER NOT NULL,
                fuel_date DATE NOT NULL,
                fuel_type VARCHAR(50) DEFAULT 'Petrol',
                quantity DECIMAL(8,2) NOT NULL,
                cost_per_liter DECIMAL(8,2) NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                odometer_reading INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tables created successfully');
        
        // Insert sample data if empty
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
        
        console.log(`🎉 Database setup completed using ${dbType.toUpperCase()}!`);
        return true;
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        return false;
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}

module.exports = { setupDatabase };
