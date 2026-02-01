// Railway.app Persistent Startup Script
require('dotenv').config();

// Force Railway.app environment variables
if (process.env.RAILWAY_ENVIRONMENT !== 'production') {
    console.log('🚆 Setting Railway.app environment variables...');

    // Force production environment
    process.env.NODE_ENV = 'production';
    process.env.RAILWAY_ENVIRONMENT = 'production';

    // Force database configuration
    process.env.DB_HOST = process.env.DB_HOST || 'shuttle.proxy.rlwy.net';
    process.env.DB_PORT = process.env.DB_PORT || '35740';
    process.env.DB_NAME = process.env.DB_NAME || 'railway';
    process.env.DB_USER = process.env.DB_USER || 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw';
    process.env.RAILWAY_DB_URL = process.env.RAILWAY_DB_URL || 'mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway';

    // Force JWT configuration
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_nit_itvms_production_2024';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    // Force CORS configuration
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://nit-itvms-production.railway.app';

    // Force port
    process.env.PORT = process.env.PORT || '8080';

    console.log('✅ Railway.app environment variables set');
}

// Setup persistent database before starting server
async function startApp() {
    try {
        console.log('🔧 Setting up persistent database for Railway.app...');
        const { setupPersistentDatabase } = require('./persistent-database-setup');
        await setupPersistentDatabase();
        console.log('✅ Database setup complete');
        
        console.log('🚀 Starting NIT ITVMS Server...');
        require('./backend/src/server.js');
        
    } catch (error) {
        console.error('❌ Failed to setup database, starting server anyway:', error);
        console.log('🚀 Starting NIT ITVMS Server...');
        require('./backend/src/server.js');
    }
}

// Wait a bit for MySQL to be ready, then start
console.log('⏳ Waiting for MySQL to be ready...');
setTimeout(startApp, 5000); // Wait 5 seconds for MySQL to fully start
