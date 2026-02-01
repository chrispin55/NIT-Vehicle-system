const mysql = require('mysql2/promise');
require('dotenv').config();

// Google Cloud SQL configuration
const dbConfig = {
  host: process.env.DB_HOST || process.env.CLOUD_SQL_CONNECTION_NAME || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nit_itvms',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    // For Cloud SQL, you might need specific SSL configuration
    ca: process.env.DB_CA_CERT,
    key: process.env.DB_KEY_CERT,
    cert: process.env.DB_CLIENT_CERT
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Additional Cloud SQL specific settings
  charset: 'utf8mb4',
  timezone: '+00:00'
};

const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Google Cloud SQL connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Google Cloud SQL connection failed:', error.message);
    return false;
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing Google Cloud SQL database...');
    
    // Create tables if they don't exist
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_username (username),
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate_number VARCHAR(20) UNIQUE NOT NULL,
        vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
        model VARCHAR(100) NOT NULL,
        manufacture_year INT NOT NULL,
        status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
        fuel_capacity DECIMAL(8,2),
        current_fuel DECIMAL(8,2) DEFAULT 0,
        mileage DECIMAL(10,2) DEFAULT 0,
        last_service_date DATE,
        next_service_date DATE,
        insurance_expiry DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicles_plate (plate_number),
        INDEX idx_vehicles_status (status),
        INDEX idx_vehicles_type (vehicle_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      
      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        driver_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        experience_years INT DEFAULT 0,
        assigned_vehicle_id INT,
        status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_drivers_license (license_number),
        INDEX idx_drivers_status (status),
        FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id VARCHAR(20) UNIQUE NOT NULL,
        route TEXT NOT NULL,
        driver_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        trip_date DATE NOT NULL,
        trip_time TIME NOT NULL,
        fuel_used DECIMAL(8,2),
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_trips_date (trip_date),
        INDEX idx_trips_status (status),
        INDEX idx_trips_driver (driver_id),
        INDEX idx_trips_vehicle (vehicle_id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        service_date DATE NOT NULL,
        service_type ENUM('Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other') NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        next_service_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_maintenance_vehicle (vehicle_id),
        INDEX idx_maintenance_date (service_date),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.query(createTablesSQL);
    console.log('✅ Database schema initialized successfully');
    
    // Insert sample data if tables are empty
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0][0].count === 0) {
      await insertSampleData();
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Insert sample data
const insertSampleData = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
      ('admin', 'admin@nit.ac.tz', ?, 'System Administrator', 'admin')
    `, [hashedPassword]);
    
    // Insert sample vehicles
    await pool.query(`
      INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES 
      ('T 123 ABC', 'Minibus', 'Toyota Hiace', 2021, 'Active'),
      ('T 456 DEF', 'SUV', 'Nissan Patrol', 2019, 'Active'),
      ('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2022, 'Active')
    `);
    
    // Insert sample drivers
    await pool.query(`
      INSERT INTO drivers (driver_id, full_name, license_number, experience_years, status) VALUES 
      ('DRV-001', 'John Mwambene', 'DL-123456', 8, 'Active'),
      ('DRV-002', 'Sarah Juma', 'DL-234567', 5, 'Active'),
      ('DRV-003', 'Robert Kimambo', 'DL-345678', 12, 'Active')
    `);
    
    console.log('✅ Sample data inserted successfully');
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  async query(sql, params) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  async getConnection() {
    try {
      return await pool.getConnection();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
};
