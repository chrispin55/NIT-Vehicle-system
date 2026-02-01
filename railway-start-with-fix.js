// Railway.app startup script with automatic database fix
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

// Auto-fix database on first deployment
async function autoFixDatabase() {
    try {
        console.log('🔧 Checking if database needs fixing...');
        
        const { Sequelize } = require('sequelize');
        const sequelize = new Sequelize({
            host: process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
            port: process.env.DB_PORT || 35740,
            database: process.env.DB_NAME || 'railway',
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw',
            dialect: 'mysql',
            logging: false, // Reduce log noise during startup
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        });

        // Test connection
        await sequelize.authenticate();
        
        // Check if vehicles table exists and has correct structure
        try {
            const [results] = await sequelize.query('DESCRIBE vehicles');
            const idField = results.find(field => field.Field === 'id');
            
            if (!idField || !idField.Extra.includes('auto_increment')) {
                console.log('🔧 Database needs fixing - running fix script...');
                
                // Run the fix script
                const { fixDatabase } = require('./fix-database');
                await fixDatabase();
                
                console.log('✅ Database fixed successfully!');
            } else {
                console.log('✅ Database structure is correct');
            }
        } catch (error) {
            console.log('🔧 Tables don\'t exist - running fix script...');
            const { fixDatabase } = require('./fix-database');
            await fixDatabase();
            console.log('✅ Database created and fixed successfully!');
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Auto-fix failed:', error.message);
        // Don't exit - let the main server start anyway
    }
}

// Auto-fix database before starting server
autoFixDatabase().then(() => {
    console.log('🚀 Starting NIT ITVMS Server...');
    require('./backend/src/server.js');
}).catch(error => {
    console.error('❌ Failed to auto-fix database, starting server anyway:', error);
    console.log('🚀 Starting NIT ITVMS Server...');
    require('./backend/src/server.js');
});
