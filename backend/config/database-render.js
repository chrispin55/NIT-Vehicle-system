const mysql = require('mysql2/promise');
require('dotenv').config();

// Render PostgreSQL configuration (we'll use PostgreSQL instead of MySQL for Render)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'nit_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nit_itvms',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// For Render, we'll use PostgreSQL instead of MySQL
// Let's create a simple in-memory database for demo purposes
let demoData = {
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

// Mock database connection for Render demo
const testConnection = async () => {
  try {
    // For demo purposes, we'll simulate a successful connection
    // In production, you would connect to Render's PostgreSQL
    console.log('✅ Render database connection simulated (demo mode)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database with demo data
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing Render database with demo data...');
    
    // In production, you would create tables here
    // For demo, we'll use the in-memory data
    console.log('✅ Demo data initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Simple query function for demo
const query = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // Mock query implementation for demo
    setTimeout(() => {
      try {
        // Simple mock responses based on SQL patterns
        if (sql.includes('SELECT') && sql.includes('vehicles')) {
          resolve([demoData.vehicles]);
        } else if (sql.includes('SELECT') && sql.includes('drivers')) {
          resolve([demoData.drivers]);
        } else if (sql.includes('SELECT') && sql.includes('trips')) {
          resolve([demoData.trips]);
        } else if (sql.includes('SELECT') && sql.includes('maintenance')) {
          resolve([demoData.maintenance]);
        } else if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
          resolve([{ insertId: Math.floor(Math.random() * 1000), affectedRows: 1 }]);
        } else {
          resolve([[]]);
        }
      } catch (error) {
        reject(error);
      }
    }, 100); // Simulate database latency
  });
};

// Get single record
const get = async (table, id) => {
  const data = demoData[table] || [];
  return data.find(item => item.id === parseInt(id));
};

// Create record
const create = async (table, data) => {
  const tableData = demoData[table] || [];
  const newId = Math.max(...tableData.map(item => item.id), 0) + 1;
  const newRecord = { id: newId, ...data, created_at: new Date() };
  tableData.push(newRecord);
  return newRecord;
};

// Update record
const update = async (table, id, data) => {
  const tableData = demoData[table] || [];
  const index = tableData.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    tableData[index] = { ...tableData[index], ...data, updated_at: new Date() };
    return tableData[index];
  }
  return null;
};

// Delete record
const remove = async (table, id) => {
  const tableData = demoData[table] || [];
  const index = tableData.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    return tableData.splice(index, 1)[0];
  }
  return null;
};

module.exports = {
  testConnection,
  initializeDatabase,
  query,
  get,
  create,
  update,
  remove
};
