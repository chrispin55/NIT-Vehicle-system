const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'NIT ITVMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    const { testConnection } = require('./config/database');
    
    // Test database connection
    await testConnection();
    
    // Check table structure
    const { sequelize } = require('./config/database');
    const [vehicleResults] = await sequelize.query("DESCRIBE vehicles");
    const [driverResults] = await sequelize.query("DESCRIBE drivers");
    
    // Check table counts
    const [vehicleCount] = await sequelize.query("SELECT COUNT(*) as count FROM vehicles");
    const [driverCount] = await sequelize.query("SELECT COUNT(*) as count FROM drivers");
    
    res.json({
      status: 'OK',
      message: 'Database connection and tables verified',
      tables: {
        vehicles: {
          structure: vehicleResults,
          count: vehicleCount[0].count
        },
        drivers: {
          structure: driverResults,
          count: driverCount[0].count
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API info endpoint
app.get('/api-info', (req, res) => {
  res.json({
    message: 'NIT ITVMS API Server',
    status: 'Running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      drivers: '/api/drivers',
      trips: '/api/trips',
      maintenance: '/api/maintenance',
      dashboard: '/api/dashboard'
    },
    frontend: 'Root URL (/) serves the frontend application'
  });
});

// Root route - serve frontend or API info
app.get('/', (req, res) => {
  // Always serve the frontend HTML file
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 NIT ITVMS Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
