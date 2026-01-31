const express = require('express');
const { body, validationResult } = require('express-validator');
const { Trip, Driver, Vehicle } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const { status, date_from, date_to } = req.query;
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (date_from || date_to) {
      whereClause.trip_date = {};
      if (date_from) whereClause.trip_date[Op.gte] = date_from;
      if (date_to) whereClause.trip_date[Op.lte] = date_to;
    }

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        { association: 'driver', attributes: ['id', 'full_name', 'driver_id'] },
        { association: 'vehicle', attributes: ['id', 'plate_number', 'model', 'vehicle_type'] }
      ],
      order: [['trip_date', 'DESC'], ['trip_time', 'DESC']]
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { association: 'driver' },
        { association: 'vehicle' }
      ]
    });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new trip
router.post('/', [
  body('trip_id').notEmpty().withMessage('Trip ID is required'),
  body('route').notEmpty().withMessage('Route is required'),
  body('driver_id').isInt().withMessage('Driver ID must be a valid integer'),
  body('vehicle_id').isInt().withMessage('Vehicle ID must be a valid integer'),
  body('trip_date').isDate().withMessage('Valid trip date is required'),
  body('trip_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is HH:MM'),
  body('estimated_fuel_liters').isFloat({ min: 0.1 }).withMessage('Estimated fuel must be greater than 0'),
  body('status').optional().isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if driver and vehicle exist and are available
    const driver = await Driver.findByPk(req.body.driver_id);
    const vehicle = await Vehicle.findByPk(req.body.vehicle_id);
    
    if (!driver) {
      return res.status(400).json({ error: 'Driver not found' });
    }
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found' });
    }
    if (driver.status !== 'Active') {
      return res.status(400).json({ error: 'Driver is not active' });
    }
    if (vehicle.status !== 'Active') {
      return res.status(400).json({ error: 'Vehicle is not available' });
    }

    const trip = await Trip.create(req.body);
    const tripWithDetails = await Trip.findByPk(trip.id, {
      include: [
        { association: 'driver' },
        { association: 'vehicle' }
      ]
    });
    res.status(201).json(tripWithDetails);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Trip ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update trip
router.put('/:id', [
  body('route').optional().notEmpty().withMessage('Route cannot be empty'),
  body('driver_id').optional().isInt().withMessage('Driver ID must be a valid integer'),
  body('vehicle_id').optional().isInt().withMessage('Vehicle ID must be a valid integer'),
  body('trip_date').optional().isDate().withMessage('Valid trip date is required'),
  body('trip_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is HH:MM'),
  body('estimated_fuel_liters').optional().isFloat({ min: 0.1 }).withMessage('Estimated fuel must be greater than 0'),
  body('status').optional().isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await trip.update(req.body);
    const updatedTrip = await Trip.findByPk(trip.id, {
      include: [
        { association: 'driver' },
        { association: 'vehicle' }
      ]
    });
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await trip.destroy();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trip statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Trip.count();
    const scheduled = await Trip.count({ where: { status: 'Scheduled' } });
    const inProgress = await Trip.count({ where: { status: 'In Progress' } });
    const completed = await Trip.count({ where: { status: 'Completed' } });
    const cancelled = await Trip.count({ where: { status: 'Cancelled' } });

    // Get today's trips
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = await Trip.count({
      where: { trip_date: today }
    });

    res.json({
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      todayTrips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available drivers and vehicles for trip creation
router.get('/resources/available', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'full_name', 'driver_id']
    });
    
    const vehicles = await Vehicle.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'plate_number', 'model', 'vehicle_type']
    });

    res.json({ drivers, vehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
