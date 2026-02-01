const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Use Railway-specific database config
const { testConnection } = require('./backend/config/database-railway');
const { initializeDatabase } = require('./scripts/init-database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration for Railway
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.PUBLIC_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Railway
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/vehicles', require('./backend/routes/vehicles'));
app.use('/api/drivers', require('./backend/routes/drivers'));
app.use('/api/trips', require('./backend/routes/trips'));
app.use('/api/maintenance', require('./backend/routes/maintenance'));
app.use('/api/reports', require('./backend/routes/reports'));
app.use('/api/auth', require('./backend/routes/auth'));

// Serve the main HTML file for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server with database connection test
const startServer = async () => {
  try {
    console.log('🚀 Starting NIT ITVMS Server...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connection established');
      
      // Initialize database schema
      try {
        await initializeDatabase();
        console.log('✅ Database schema initialized');
      } catch (initError) {
        console.log('⚠️  Database initialization failed, but server will continue:', initError.message);
      }
    } else {
      console.log('⚠️  Database connection failed, but server will start anyway');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 NIT ITVMS Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Dashboard: ${process.env.PUBLIC_URL || `http://localhost:${PORT}`}`);
      console.log(`🔗 Health Check: ${process.env.PUBLIC_URL || `http://localhost:${PORT}`}/api/health`);
      
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
        console.log(`🌍 Public URL: ${process.env.PUBLIC_URL}`);
      }
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
