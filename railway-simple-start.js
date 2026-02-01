// Railway.app Simple Startup - Works with MySQL or SQLite fallback
require('dotenv').config();

// Set environment variables
console.log('🚆 Setting up Railway.app environment...');

process.env.NODE_ENV = 'production';
process.env.RAILWAY_ENVIRONMENT = 'production';

// Database configuration (will be set by database setup)
process.env.DB_HOST = process.env.RAILWAY_PRIVATE_DOMAIN || 'shuttle.proxy.rlwy.net';
process.env.DB_PORT = process.env.RAILWAY_TCP_PORT || '35740';
process.env.DB_NAME = process.env.RAILWAY_DB_NAME || 'railway';
process.env.DB_USER = process.env.RAILWAY_DB_USERNAME || 'root';
process.env.DB_PASSWORD = process.env.RAILWAY_DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw';

// JWT and other configs
process.env.JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_nit_itvms_production_2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://nit-itvms-production.railway.app';
process.env.PORT = process.env.PORT || '8080';

console.log('✅ Environment configured');

// Simple startup function
async function simpleStart() {
    console.log('🚀 Starting Railway.app simple startup...');
    
    try {
        // Setup database (MySQL with SQLite fallback)
        console.log('🔧 Setting up database...');
        const { setupDatabase } = require('./railway-sqlite-fallback');
        const success = await setupDatabase();
        
        if (success) {
            console.log('✅ Database setup successful!');
        } else {
            console.log('⚠️ Database setup failed, but continuing...');
        }
        
        // Start server
        console.log('🚀 Starting NIT ITVMS Server...');
        require('./backend/src/server.js');
        
    } catch (error) {
        console.error('❌ Startup failed:', error);
        console.log('🔄 Retrying in 5 seconds...');
        
        // Retry once after 5 seconds
        setTimeout(() => {
            console.log('🚀 Retrying server start...');
            try {
                require('./backend/src/server.js');
            } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
                process.exit(1);
            }
        }, 5000);
    }
}

// Start with a small delay
console.log('⏳ Initializing...');
setTimeout(simpleStart, 3000); // Wait 3 seconds

// Handle shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down...');
    process.exit(0);
});
