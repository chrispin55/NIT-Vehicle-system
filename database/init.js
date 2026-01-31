const { pool, testConnection } = require('./config');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        await pool.execute(statement);
      } catch (error) {
        // Ignore errors for CREATE DATABASE and INSERT IGNORE statements
        if (!statement.includes('CREATE DATABASE') && !statement.includes('INSERT IGNORE')) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error.message);
        }
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('📊 Sample data has been inserted');
    
    // Test the setup by querying some data
    const [vehicles] = await pool.execute('SELECT COUNT(*) as count FROM vehicles');
    const [drivers] = await pool.execute('SELECT COUNT(*) as count FROM drivers');
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`📈 Database contains: ${vehicles[0].count} vehicles, ${drivers[0].count} drivers, ${users[0].count} users`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
