const { Pool } = require('pg');
require('dotenv').config();

// Check if we have real database credentials
const hasRealDatabase = process.env.DB_HOST && 
                        process.env.DB_USER && 
                        process.env.DB_PASSWORD && 
                        process.env.DB_NAME;

// PostgreSQL configuration for Render
const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create pool if we have real database credentials
const pool = hasRealDatabase ? new Pool(poolConfig) : null;

// Demo data for fallback mode
let demoData = {
  users: [
    { id: 1, username: 'admin', email: 'admin@nit.ac.tz', password_hash: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'admin', is_active: true, created_at: new Date() },
    { id: 2, username: 'manager', email: 'manager@nit.ac.tz', password_hash: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'manager', is_active: true, created_at: new Date() },
    { id: 3, username: 'driver1', email: 'driver1@nit.ac.tz', password_hash: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'driver', is_active: true, created_at: new Date() }
  ],
  vehicles: [
    { id: 1, make: 'Toyota', model: 'Camry', year: 2022, plate: 'NIT-001', status: 'active', created_at: new Date() },
    { id: 2, make: 'Honda', model: 'CR-V', year: 2023, plate: 'NIT-002', status: 'active', created_at: new Date() },
    { id: 3, make: 'Nissan', model: 'Sentra', year: 2021, plate: 'NIT-003', status: 'maintenance', created_at: new Date() }
  ],
  drivers: [
    { id: 1, name: 'John Doe', license: 'DL001', phone: '+255123456789', email: 'john@nit.ac.tz', status: 'active', created_at: new Date() },
    { id: 2, name: 'Jane Smith', license: 'DL002', phone: '+255987654321', email: 'jane@nit.ac.tz', status: 'active', created_at: new Date() },
    { id: 3, name: 'Ali Hassan', license: 'DL003', phone: '+255555555555', email: 'ali@nit.ac.tz', status: 'active', created_at: new Date() }
  ],
  trips: [
    { id: 1, vehicle_id: 1, driver_id: 1, origin: 'NIT Campus', destination: 'City Center', date: '2026-02-02', status: 'completed', created_at: new Date() },
    { id: 2, vehicle_id: 2, driver_id: 2, origin: 'NIT Campus', destination: 'Airport', date: '2026-02-02', status: 'active', created_at: new Date() },
    { id: 3, vehicle_id: 1, driver_id: 3, origin: 'NIT Campus', destination: 'Kariakoo', date: '2026-02-01', status: 'completed', created_at: new Date() }
  ],
  maintenance: [
    { id: 1, vehicle_id: 3, type: 'Oil Change', cost: 50000, date: '2026-02-01', status: 'completed', created_at: new Date() },
    { id: 2, vehicle_id: 1, type: 'Tire Rotation', cost: 30000, date: '2026-02-02', status: 'scheduled', created_at: new Date() }
  ]
};

// Test database connection
const testConnection = async () => {
  try {
    if (hasRealDatabase && pool) {
      // Test real PostgreSQL connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL database connected successfully');
      return true;
    } else {
      // Demo mode
      console.log('✅ Using demo mode (no database connection required)');
      return true;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Falling back to demo mode');
    return false;
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    if (hasRealDatabase && pool) {
      console.log('🔄 Initializing PostgreSQL database...');
      
      // Create tables if they don't exist
      const client = await pool.connect();
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'driver', 'staff')),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create vehicles table
      await client.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          plate_number VARCHAR(20) UNIQUE NOT NULL,
          vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van')),
          model VARCHAR(100) NOT NULL,
          manufacture_year INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Inactive')),
          fuel_capacity DECIMAL(8,2),
          current_fuel DECIMAL(8,2) DEFAULT 0,
          mileage DECIMAL(10,2) DEFAULT 0,
          last_service_date DATE,
          next_service_date DATE,
          insurance_expiry DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create drivers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS drivers (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          license_number VARCHAR(50) UNIQUE NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(100),
          address TEXT,
          date_of_birth DATE,
          hire_date DATE,
          license_expiry DATE,
          status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
          experience_years INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create trips table
      await client.query(`
        CREATE TABLE IF NOT EXISTS trips (
          id SERIAL PRIMARY KEY,
          vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
          driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
          trip_date DATE NOT NULL,
          start_time TIME,
          end_time TIME,
          origin VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NOT NULL,
          purpose TEXT,
          distance_km DECIMAL(8,2),
          fuel_consumed DECIMAL(8,2),
          status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create maintenance table
      await client.query(`
        CREATE TABLE IF NOT EXISTS maintenance (
          id SERIAL PRIMARY KEY,
          vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
          maintenance_type VARCHAR(100) NOT NULL,
          description TEXT,
          cost DECIMAL(10,2),
          maintenance_date DATE NOT NULL,
          next_maintenance_date DATE,
          status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
          mechanic_name VARCHAR(100),
          parts_replaced TEXT,
          odometer_reading DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if we need to insert sample data
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) === 0) {
        // Insert sample users
        await client.query(`
          INSERT INTO users (username, email, password_hash, full_name, role) VALUES
          ('admin', 'admin@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'System Administrator', 'admin'),
          ('manager', 'manager@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'Transport Manager', 'manager'),
          ('driver1', 'driver1@nit.ac.tz', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'John Mwambene', 'driver')
        `);

        // Insert sample vehicles
        await client.query(`
          INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status, fuel_capacity) VALUES
          ('NIT-001', 'SUV', 'Toyota Land Cruiser', 2022, 'Active', 80.0),
          ('NIT-002', 'Minibus', 'Toyota Hiace', 2021, 'Active', 60.0),
          ('NIT-003', 'Sedan', 'Toyota Corolla', 2023, 'Active', 50.0)
        `);

        // Insert sample drivers
        await client.query(`
          INSERT INTO drivers (full_name, license_number, phone, email, experience_years) VALUES
          ('John Mwambene', 'DL-123456', '+255712345678', 'john@nit.ac.tz', 8),
          ('Sarah Juma', 'DL-234567', '+255712345679', 'sarah@nit.ac.tz', 5),
          ('Robert Kimambo', 'DL-345678', '+255712345680', 'robert@nit.ac.tz', 12)
        `);

        console.log('✅ Sample data inserted into PostgreSQL');
      }

      client.release();
      console.log('✅ PostgreSQL database initialized successfully');
      return true;
    } else {
      // Demo mode
      console.log('🔄 Using demo mode with sample data...');
      console.log('✅ Demo data initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Query function
const query = async (sql, params = []) => {
  try {
    if (hasRealDatabase && pool) {
      // Real PostgreSQL query
      const result = await pool.query(sql, params);
      return result.rows;
    } else {
      // Demo mode query
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Simple mock responses based on SQL patterns
            if (sql.includes('SELECT') && sql.includes('users')) {
              resolve(demoData.users);
            } else if (sql.includes('SELECT') && sql.includes('vehicles')) {
              resolve(demoData.vehicles);
            } else if (sql.includes('SELECT') && sql.includes('drivers')) {
              resolve(demoData.drivers);
            } else if (sql.includes('SELECT') && sql.includes('trips')) {
              resolve(demoData.trips);
            } else if (sql.includes('SELECT') && sql.includes('maintenance')) {
              resolve(demoData.maintenance);
            } else if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
              resolve([{ insertId: Math.floor(Math.random() * 1000), affectedRows: 1 }]);
            } else {
              resolve([]);
            }
          } catch (error) {
            reject(error);
          }
        }, 50); // Simulate database latency
      });
    }
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

// Get single record
const get = async (table, id) => {
  try {
    if (hasRealDatabase && pool) {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      return result.rows[0] || null;
    } else {
      const data = demoData[table] || [];
      return data.find(item => item.id === parseInt(id));
    }
  } catch (error) {
    console.error('❌ Get error:', error);
    throw error;
  }
};

// Create record
const create = async (table, data) => {
  try {
    if (hasRealDatabase && pool) {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const result = await pool.query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    } else {
      const tableData = demoData[table] || [];
      const newId = Math.max(...tableData.map(item => item.id), 0) + 1;
      const newRecord = { id: newId, ...data, created_at: new Date() };
      tableData.push(newRecord);
      return newRecord;
    }
  } catch (error) {
    console.error('❌ Create error:', error);
    throw error;
  }
};

// Update record
const update = async (table, id, data) => {
  try {
    if (hasRealDatabase && pool) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
      
      const result = await pool.query(
        `UPDATE ${table} SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0] || null;
    } else {
      const tableData = demoData[table] || [];
      const index = tableData.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        tableData[index] = { ...tableData[index], ...data, updated_at: new Date() };
        return tableData[index];
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  }
};

// Delete record
const remove = async (table, id) => {
  try {
    if (hasRealDatabase && pool) {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
      return result.rows[0] || null;
    } else {
      const tableData = demoData[table] || [];
      const index = tableData.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        return tableData.splice(index, 1)[0];
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
};

// Close pool (for graceful shutdown)
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('🔒 Database pool closed');
  }
};

module.exports = {
  testConnection,
  initializeDatabase,
  query,
  get,
  create,
  update,
  remove,
  closePool,
  hasRealDatabase
};
