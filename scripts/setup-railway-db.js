// Simple Railway database setup script
const fs = require('fs');
const path = require('path');

// This script will be executed by Railway to set up the database
async function setupDatabase() {
  try {
    console.log('🔄 Setting up Railway MySQL database...');
    
    // Railway automatically provides these environment variables
    const dbConfig = {
      host: process.env.RAILWAY_PRIVATE_DOMAIN,
      port: process.env.RAILWAY_TCP_PORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE
    };
    
    console.log('📊 Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? '***' : 'not set'
    });
    
    // Check if all required variables are present
    if (!dbConfig.host || !dbConfig.port || !dbConfig.user || !dbConfig.database) {
      throw new Error('Missing required Railway database environment variables');
    }
    
    console.log('✅ Railway database configuration is valid');
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

// Export for use in server
module.exports = { setupDatabase };

// Run if executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}
