const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

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
    message: 'NIT ITVMS Demo Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-demo',
    database: 'Demo mode - no database connection'
  });
});

// Demo API endpoints (without database)
app.get('/api/vehicles', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, make: 'Toyota', model: 'Camry', year: 2022, plate: 'NIT-001', status: 'active' },
      { id: 2, make: 'Honda', model: 'CR-V', year: 2023, plate: 'NIT-002', status: 'active' }
    ],
    message: 'Demo vehicles data (no database)'
  });
});

app.get('/api/drivers', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', license: 'DL001', phone: '+255123456789', status: 'active' },
      { id: 2, name: 'Jane Smith', license: 'DL002', phone: '+255987654321', status: 'active' }
    ],
    message: 'Demo drivers data (no database)'
  });
});

app.get('/api/trips', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, vehicle_id: 1, driver_id: 1, origin: 'NIT Campus', destination: 'City Center', date: '2026-02-01', status: 'completed' },
      { id: 2, vehicle_id: 2, driver_id: 2, origin: 'NIT Campus', destination: 'Airport', date: '2026-02-01', status: 'active' }
    ],
    message: 'Demo trips data (no database)'
  });
});

// API routes (demo responses)
app.post('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'Demo mode - operation would be performed with database',
    data: req.body
  });
});

app.put('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'Demo mode - operation would be performed with database',
    data: req.body
  });
});

app.delete('/api/*', (req, res) => {
  res.json({
    success: true,
    message: 'Demo mode - operation would be performed with database'
  });
});

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

// Start server
app.listen(PORT, () => {
  console.log('🚀 NIT ITVMS Demo Server running on port', PORT);
  console.log('📊 Platform: Google Cloud Platform (Demo Mode)');
  console.log('🔗 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🌐 Frontend: http://localhost:' + PORT);
  console.log('💡 Demo mode: No database connection required');
});

module.exports = app;
