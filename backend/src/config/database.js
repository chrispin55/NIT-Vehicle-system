const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration for Railway.app and local development
const getDatabaseConfig = () => {
  // Debug: Log all environment variables
  console.log('🔍 Environment Variables Debug:');
  console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('RAILWAY_DB_URL:', process.env.RAILWAY_DB_URL ? 'SET' : 'NOT SET');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);
  
  // Always use Railway.app configuration when in Railway.app environment
  if (process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production') {
    console.log('🚆 Railway.app environment detected');
    return {
      host: process.env.RAILWAY_PRIVATE_DOMAIN || process.env.DB_HOST || 'shuttle.proxy.rlwy.net',
      port: parseInt(process.env.RAILWAY_TCP_PORT) || parseInt(process.env.DB_PORT) || 35740,
      database: process.env.RAILWAY_DB_NAME || process.env.DB_NAME || 'railway',
      username: process.env.RAILWAY_DB_USERNAME || process.env.DB_USER || 'root',
      password: process.env.RAILWAY_DB_PASSWORD || process.env.DB_PASSWORD || 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw',
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    };
  }
  
  console.log('🏠 Using local development database configuration');
  // Local development
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'nit_itvms',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
};

const sequelize = new Sequelize(getDatabaseConfig());

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database: ${sequelize.config.database}`);
    console.log(`🌐 Host: ${sequelize.config.host}:${sequelize.config.port}`);
    
    // Test Railway.app specific connection
    if (process.env.RAILWAY_ENVIRONMENT === 'production') {
      console.log('🚆 Railway.app production database connected');
      console.log(`🔗 Connection URL: ${process.env.RAILWAY_DB_URL}`);
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    console.log('💡 Please check your database configuration');
    
    if (process.env.RAILWAY_ENVIRONMENT === 'production') {
      console.log('🚆 Railway.app environment detected');
      console.log('📝 Railway.app connection string:', process.env.RAILWAY_DB_URL);
      console.log('🌐 Host:', process.env.DB_HOST);
      console.log('🔌 Port:', process.env.DB_PORT);
    } else {
      console.log('🏠 Local development environment');
      console.log('💾 Make sure MySQL is running and accessible');
    }
  }
};

module.exports = { sequelize, testConnection };
