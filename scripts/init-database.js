// Database initialization script for Railway deployment
const fs = require('fs');
const path = require('path');
const { testConnection, query } = require('../backend/config/database-railway');

async function initializeDatabase() {
  try {
    console.log('🔄 Starting database initialization...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connected successfully');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema-railway.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        await query(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        // Ignore errors for IF NOT EXISTS statements
        if (!statement.includes('IF NOT EXISTS')) {
          console.error(`❌ Error executing statement: ${statement.substring(0, 50)}...`);
          console.error(`Error: ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
    // Verify tables were created
    const tables = await query('SHOW TABLES');
    console.log(`📊 Created ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
