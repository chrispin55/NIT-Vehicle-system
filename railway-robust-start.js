// Railway.app Robust Startup Script
require('dotenv').config();

// Set environment variables for Railway.app
console.log('🚆 Setting up Railway.app environment...');

// Force production environment
process.env.NODE_ENV = 'production';
process.env.RAILWAY_ENVIRONMENT = 'production';

// Use Railway.app environment variables or fallback to hardcoded ones
process.env.DB_HOST = process.env.RAILWAY_PRIVATE_DOMAIN || process.env.DB_HOST || 'shuttle.proxy.rlwy.net';
process.env.DB_PORT = process.env.RAILWAY_TCP_PORT || process.env.DB_PORT || '35740';
process.env.DB_NAME = process.env.RAILWAY_DB_NAME || process.env.DB_NAME || 'railway';
process.env.DB_USER = process.env.RAILWAY_DB_USERNAME || process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.RAILWAY_DB_PASSWORD || process.env.DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw';

// Construct database URL
process.env.RAILWAY_DB_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// JWT configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_nit_itvms_production_2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// CORS configuration
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://nit-itvms-production.railway.app';

// Port configuration
process.env.PORT = process.env.PORT || '8080';

console.log('✅ Environment variables configured');
console.log(`🔗 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Robust startup function
async function robustStart() {
    console.log('🚀 Starting Railway.app robust startup...');
    
    let databaseSetupSuccess = false;
    
    // Try database setup multiple times
    for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`🔧 Database setup attempt ${attempt}/3...`);
        
        try {
            const { setupRailwayDatabase } = require('./railway-mysql-fix');
            databaseSetupSuccess = await setupRailwayDatabase();
            
            if (databaseSetupSuccess) {
                console.log('✅ Database setup successful!');
                break;
            }
        } catch (error) {
            console.error(`❌ Database setup attempt ${attempt} failed:`, error.message);
        }
        
        if (attempt < 3) {
            console.log('⏳ Waiting 5 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    if (!databaseSetupSuccess) {
        console.log('⚠️ Database setup failed, but starting server anyway...');
        console.log('⚠️ Some features may not work properly');
    }
    
    // Start the server regardless of database setup
    try {
        console.log('🚀 Starting NIT ITVMS Server...');
        require('./backend/src/server.js');
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Wait for MySQL to be ready
console.log('⏳ Waiting for MySQL service to be ready...');

// Start with a delay to ensure MySQL is ready
setTimeout(robustStart, 10000); // Wait 10 seconds

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
