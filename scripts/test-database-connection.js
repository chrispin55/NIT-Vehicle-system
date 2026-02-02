#!/usr/bin/env node

// Test Database Connection Script
require('dotenv').config();

console.log('🔍 Testing Database Connection');
console.log('=============================');

// Show current environment variables
console.log('📋 Current Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || '5432');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Test PostgreSQL connection
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
  console.log('\n🔗 Attempting PostgreSQL connection...');
  
  const { Pool } = require('pg');
  
  const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  };
  
  console.log('🔧 Connection Config:');
  console.log('  Host:', poolConfig.host);
  console.log('  Port:', poolConfig.port);
  console.log('  User:', poolConfig.user);
  console.log('  Database:', poolConfig.database);
  console.log('  SSL:', poolConfig.ssl);
  
  const pool = new Pool(poolConfig);
  
  pool.connect()
    .then(client => {
      console.log('✅ PostgreSQL connection successful!');
      
      // Test basic query
      return client.query('SELECT version() as version, current_database() as database, current_user as user')
        .then(result => {
          const row = result.rows[0];
          console.log('📊 Database Info:');
          console.log('  Version:', row.version);
          console.log('  Database:', row.database);
          console.log('  User:', row.user);
          
          // Test table creation
          return client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
            .then(() => {
              console.log('✅ Test table created successfully');
              
              // Test insert
              return client.query('INSERT INTO test_connection (created_at) VALUES (DEFAULT) RETURNING id')
                .then(result => {
                  console.log('✅ Test insert successful, ID:', result.rows[0].id);
                  
                  // Clean up
                  return client.query('DROP TABLE IF EXISTS test_connection')
                    .then(() => {
                      console.log('✅ Test table cleaned up');
                      client.release();
                      return pool.end();
                    });
                });
            });
        })
        .then(() => {
          console.log('✅ All database tests passed!');
          console.log('🎉 Database is ready for production use!');
          process.exit(0);
        });
    })
    .catch(err => {
      console.error('❌ PostgreSQL connection failed:');
      console.error('   Error:', err.message);
      console.error('   Code:', err.code);
      console.error('   Severity:', err.severity);
      console.error('   Detail:', err.detail);
      console.error('   Hint:', err.hint);
      
      pool.end().then(() => {
        console.log('\n💡 Common Solutions:');
        console.log('1. Check if DB_HOST includes the full domain (.oregon.postgres.render.com)');
        console.log('2. Verify DB_USER and DB_PASSWORD are correct');
        console.log('3. Ensure DB_NAME matches the actual database name');
        console.log('4. Check if PostgreSQL database is Live in Render dashboard');
        console.log('5. Try removing database variables to use demo mode');
        process.exit(1);
      });
    });
    
} else {
  console.log('\n❌ Missing required database variables');
  console.log('💡 To fix:');
  console.log('1. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Render dashboard');
  console.log('2. Or remove all database variables to use demo mode');
  process.exit(1);
}
