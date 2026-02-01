const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway MySQL configuration
const dbConfig = {
  host: process.env.RAILWAY_PRIVATE_DOMAIN || process.env.DB_HOST || 'localhost',
  port: process.env.RAILWAY_TCP_PORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'nit_itvms',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
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
