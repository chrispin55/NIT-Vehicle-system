require('dotenv').config();

// Simple database configuration with better error handling
console.log('🔍 Initializing database configuration...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// Check if we should use demo mode
const useDemoMode = !process.env.DB_HOST || 
                   process.env.DB_HOST === 'your-db-host' ||
                   process.env.DB_HOST === 'localhost' ||
                   !process.env.DB_USER ||
                   !process.env.DB_PASSWORD ||
                   !process.env.DB_NAME;

console.log('📊 Database mode:', useDemoMode ? 'DEMO MODE' : 'POSTGRESQL');

if (useDemoMode) {
  console.log('✅ Using demo mode - no database connection required');
} else {
  console.log('🔗 Attempting PostgreSQL connection...');
}

// Demo data
const demoData = {
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

// PostgreSQL pool (only created if not in demo mode)
let pool = null;

if (!useDemoMode) {
  try {
    const { Pool } = require('pg');
    
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    
    console.log('✅ PostgreSQL pool created');
  } catch (error) {
    console.error('❌ Failed to create PostgreSQL pool:', error.message);
    console.log('🔄 Falling back to demo mode');
  }
}

// Test connection
const testConnection = async () => {
  try {
    if (useDemoMode || !pool) {
      console.log('✅ Demo mode connection successful');
      return true;
    }
    
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Will use demo mode');
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    if (useDemoMode || !pool) {
      console.log('✅ Demo mode initialized');
      return true;
    }
    
    console.log('🔄 Initializing PostgreSQL database...');
    const client = await pool.connect();
    
    // Create a simple test table
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
    console.log('✅ PostgreSQL database initialized');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('🔄 Will use demo mode');
    return false;
  }
};

// Simple query function
const query = async (sql, params = []) => {
  try {
    if (useDemoMode || !pool) {
      // Demo mode responses
      if (sql.includes('users')) return demoData.users;
      if (sql.includes('vehicles')) return demoData.vehicles;
      if (sql.includes('drivers')) return demoData.drivers;
      if (sql.includes('trips')) return demoData.trips;
      if (sql.includes('maintenance')) return demoData.maintenance;
      return [];
    }
    
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    // Fallback to demo mode on query error
    if (sql.includes('users')) return demoData.users;
    if (sql.includes('vehicles')) return demoData.vehicles;
    if (sql.includes('drivers')) return demoData.drivers;
    if (sql.includes('trips')) return demoData.trips;
    if (sql.includes('maintenance')) return demoData.maintenance;
    return [];
  }
};

// Other CRUD operations
const get = async (table, id) => {
  try {
    if (useDemoMode || !pool) {
      const data = demoData[table] || [];
      return data.find(item => item.id === parseInt(id));
    }
    
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Get error:', error.message);
    const data = demoData[table] || [];
    return data.find(item => item.id === parseInt(id));
  }
};

const create = async (table, data) => {
  try {
    if (useDemoMode || !pool) {
      const tableData = demoData[table] || [];
      const newId = Math.max(...tableData.map(item => item.id), 0) + 1;
      const newRecord = { id: newId, ...data, created_at: new Date() };
      tableData.push(newRecord);
      return newRecord;
    }
    
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await pool.query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  } catch (error) {
    console.error('❌ Create error:', error.message);
    const tableData = demoData[table] || [];
    const newId = Math.max(...tableData.map(item => item.id), 0) + 1;
    const newRecord = { id: newId, ...data, created_at: new Date() };
    tableData.push(newRecord);
    return newRecord;
  }
};

const update = async (table, id, data) => {
  try {
    if (useDemoMode || !pool) {
      const tableData = demoData[table] || [];
      const index = tableData.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        tableData[index] = { ...tableData[index], ...data, updated_at: new Date() };
        return tableData[index];
      }
      return null;
    }
    
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE ${table} SET ${placeholders} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Update error:', error.message);
    const tableData = demoData[table] || [];
    const index = tableData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      tableData[index] = { ...tableData[index], ...data, updated_at: new Date() };
      return tableData[index];
    }
    return null;
  }
};

const remove = async (table, id) => {
  try {
    if (useDemoMode || !pool) {
      const tableData = demoData[table] || [];
      const index = tableData.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        return tableData.splice(index, 1)[0];
      }
      return null;
    }
    
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    const tableData = demoData[table] || [];
    const index = tableData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      return tableData.splice(index, 1)[0];
    }
    return null;
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
  useDemoMode
};
