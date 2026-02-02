#!/usr/bin/env node

// Database Connection Debug Script
require('dotenv').config();

console.log('🔍 Database Connection Debug');
console.log('==========================');

// Check all environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);

// Check if we have all required variables
const hasRealDatabase = process.env.DB_HOST && 
                        process.env.DB_USER && 
                        process.env.DB_PASSWORD && 
                        process.env.DB_NAME;

console.log('\n🔍 Database Detection:');
console.log('hasRealDatabase:', hasRealDatabase);

if (hasRealDatabase) {
  console.log('✅ All database variables are present');
  
  // Try to connect to PostgreSQL
  const { Pool } = require('pg');
  
  const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    connectionTimeoutMillis: 5000,
  };
  
  console.log('\n🔗 Attempting PostgreSQL connection...');
  console.log('Host:', poolConfig.host);
  console.log('Port:', poolConfig.port);
  console.log('User:', poolConfig.user);
  console.log('Database:', poolConfig.database);
  
  const pool = new Pool(poolConfig);
  
  pool.connect()
    .then(client => {
      console.log('✅ PostgreSQL connection successful!');
      
      // Test a simple query
      return client.query('SELECT version()')
        .then(result => {
          console.log('📊 PostgreSQL version:', result.rows[0].version);
          client.release();
          return pool.end();
        })
        .then(() => {
          console.log('✅ Pool closed successfully');
          process.exit(0);
        });
    })
    .catch(err => {
      console.error('❌ PostgreSQL connection failed:', err.message);
      console.error('🔧 Error details:', err);
      pool.end().then(() => process.exit(1));
    });
    
} else {
  console.log('❌ Missing database variables');
  console.log('💡 Solution: Set proper environment variables in Render dashboard');
  console.log('🔄 Will use demo mode');
  process.exit(0);
}
