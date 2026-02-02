const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { testConnection, initializeDatabase } = require('./backend/config/database-simple');

const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NIT ITVMS Server is running on Render',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Render.com'
  });
});

// Import API routes
const authRoutes = require('./backend/routes/auth');
const vehicleRoutes = require('./backend/routes/vehicles');
const driverRoutes = require('./backend/routes/drivers');
const tripRoutes = require('./backend/routes/trips');
const maintenanceRoutes = require('./backend/routes/maintenance');
const reportRoutes = require('./backend/routes/reports');

// Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting NIT ITVMS Server on Render...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected successfully');
      
      // Initialize database
      console.log('🔄 Starting database initialization...');
      initializeDatabase().then(success => {
        if (success) {
          console.log('✅ Database initialization completed successfully');
        } else {
          console.log('⚠️ Database initialization failed, but server will continue');
        }
      }).catch(error => {
        console.error('❌ Database initialization error:', error.message);
      });
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('🚀 NIT ITVMS Server running on port', PORT);
      console.log('📊 Platform: Render.com');
      console.log('🔗 Health check: http://localhost:' + PORT + '/api/health');
      console.log('🌐 Frontend: http://localhost:' + PORT);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;
