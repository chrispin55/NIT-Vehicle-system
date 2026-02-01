const express = require('express');
const { body, validationResult } = require('express-validator');
const { Vehicle } = require('../models');

const router = express.Router();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ association: 'drivers' }]
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new vehicle
router.post('/', [
  body('plate_number').notEmpty().withMessage('Plate number is required'),
  body('vehicle_type').isIn(['Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van']).withMessage('Invalid vehicle type'),
  body('model').notEmpty().withMessage('Model is required'),
  body('manufacture_year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid manufacture year'),
  body('status').optional().isIn(['Active', 'Under Maintenance', 'Inactive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    console.log('🚗 Vehicle creation request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('✅ Validation passed, creating vehicle...');
    
    // Check if plate number already exists
    const existingVehicle = await Vehicle.findOne({ 
      where: { plate_number: req.body.plate_number } 
    });
    
    if (existingVehicle) {
      console.log('❌ Plate number already exists:', req.body.plate_number);
      return res.status(400).json({ error: 'Plate number already exists' });
    }

    console.log('📝 Attempting to create vehicle with data:', req.body);
    
    const vehicle = await Vehicle.create(req.body);
    
    console.log('✅ Vehicle created successfully:', vehicle);
    res.status(201).json(vehicle);
    
  } catch (error) {
    console.error('❌ Error creating vehicle:', error);
    console.error('❌ Error details:', {
      message: error.message,
      sql: error.sql,
      fields: error.fields
    });
    
    // Handle specific database errors
    if (error.message.includes("Field 'id' doesn't have a default value")) {
      res.status(500).json({ 
        error: 'Database configuration error: ID field not properly configured',
        details: 'The vehicles table may not have AUTO_INCREMENT set for the id field'
      });
    } else if (error.message.includes('ER_DUP_ENTRY')) {
      res.status(400).json({ 
        error: 'Duplicate entry: Plate number already exists',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create vehicle',
        message: error.message,
        details: error.sql || 'No SQL available'
      });
    }
  }
});

// Update vehicle
router.put('/:id', [
  body('plate_number').optional().notEmpty().withMessage('Plate number cannot be empty'),
  body('vehicle_type').optional().isIn(['Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van']).withMessage('Invalid vehicle type'),
  body('model').optional().notEmpty().withMessage('Model cannot be empty'),
  body('manufacture_year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid manufacture year'),
  body('status').optional().isIn(['Active', 'Under Maintenance', 'Inactive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Plate number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Vehicle.count();
    const active = await Vehicle.count({ where: { status: 'Active' } });
    const maintenance = await Vehicle.count({ where: { status: 'Under Maintenance' } });
    const inactive = await Vehicle.count({ where: { status: 'Inactive' } });

    res.json({
      total,
      active,
      maintenance,
      inactive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
