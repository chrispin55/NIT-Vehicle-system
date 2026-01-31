const express = require('express');
const { body, validationResult } = require('express-validator');
const { Driver, Vehicle } = require('../models');

const router = express.Router();

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      include: [{ association: 'assignedVehicle' }],
      order: [['created_at', 'DESC']]
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [{ association: 'assignedVehicle' }]
    });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new driver
router.post('/', [
  body('driver_id').notEmpty().withMessage('Driver ID is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('license_number').notEmpty().withMessage('License number is required'),
  body('experience_years').isInt({ min: 1, max: 50 }).withMessage('Experience must be between 1 and 50 years'),
  body('assigned_vehicle_id').optional().isInt().withMessage('Assigned vehicle must be a valid ID'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const driver = await Driver.create(req.body);
    const driverWithVehicle = await Driver.findByPk(driver.id, {
      include: [{ association: 'assignedVehicle' }]
    });
    res.status(201).json(driverWithVehicle);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Driver ID or license number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update driver
router.put('/:id', [
  body('driver_id').optional().notEmpty().withMessage('Driver ID cannot be empty'),
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('license_number').optional().notEmpty().withMessage('License number cannot be empty'),
  body('experience_years').optional().isInt({ min: 1, max: 50 }).withMessage('Experience must be between 1 and 50 years'),
  body('assigned_vehicle_id').optional().isInt().withMessage('Assigned vehicle must be a valid ID'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    await driver.update(req.body);
    const updatedDriver = await Driver.findByPk(driver.id, {
      include: [{ association: 'assignedVehicle' }]
    });
    res.json(updatedDriver);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Driver ID or license number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    await driver.destroy();
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available vehicles for assignment
router.get('/vehicles/available', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { status: 'Active' }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Driver.count();
    const active = await Driver.count({ where: { status: 'Active' } });
    const assigned = await Driver.count({ where: { assigned_vehicle_id: { [require('sequelize').Op.not]: null } } });

    res.json({
      total,
      active,
      assigned,
      unassigned: total - assigned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
