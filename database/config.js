const mysql = require('mysql2/promise');
require('dotenv').config();

// Import Cloud SQL connector for production
const cloudSQL = require('../gcp/cloud-sql');

const dbConfig = {
  host: process.env.DB_HOST || process.env.RAILWAY_PRIVATE_MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.RAILWAY_PRIVATE_MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.RAILWAY_PRIVATE_MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.RAILWAY_PRIVATE_MYSQL_DATABASE_NAME || 'nit_vehicle_management',
  port: process.env.DB_PORT || process.env.RAILWAY_PRIVATE_MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Use Cloud SQL in production
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const useCloudSQL = isProduction && process.env.DB_CONNECTION_NAME && !isRailway;

let pool;

async function initializePool() {
  if (useCloudSQL) {
    console.log('🔧 Initializing Cloud SQL connection...');
    pool = await cloudSQL.createPool();
  } else if (isRailway) {
    console.log('🔧 Initializing Railway MySQL connection...');
    pool = mysql.createPool(dbConfig);
  } else {
    console.log('🔧 Initializing local MySQL connection...');
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function testConnection() {
  try {
    if (!pool) {
      await initializePool();
    }
    
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function closePool() {
  if (useCloudSQL) {
    await cloudSQL.closePool();
  } else if (pool) {
    await pool.end();
  }
}

// Initialize pool on module load
initializePool().catch(console.error);

module.exports = {
  pool: pool || mysql.createPool(dbConfig),
  testConnection,
  closePool,
  config: dbConfig,
  initializePool,
  isCloudSQL: useCloudSQL
};
