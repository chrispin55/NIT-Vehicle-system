const express = require('express');
const { body, validationResult } = require('express-validator');
const { MaintenanceRecord, Vehicle } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all maintenance records
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, date_from, date_to } = req.query;
    const whereClause = {};
    
    if (vehicle_id) whereClause.vehicle_id = vehicle_id;
    if (date_from || date_to) {
      whereClause.service_date = {};
      if (date_from) whereClause.service_date[Op.gte] = date_from;
      if (date_to) whereClause.service_date[Op.lte] = date_to;
    }

    const records = await MaintenanceRecord.findAll({
      where: whereClause,
      include: [{ association: 'vehicle' }],
      order: [['service_date', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get maintenance record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByPk(req.params.id, {
      include: [{ association: 'vehicle' }]
    });
    if (!record) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new maintenance record
router.post('/', [
  body('vehicle_id').isInt().withMessage('Vehicle ID must be a valid integer'),
  body('service_date').isDate().withMessage('Valid service date is required'),
  body('service_type').isIn(['Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other']).withMessage('Invalid service type'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('next_service_date').isDate().withMessage('Valid next service date is required'),
  body('notes').optional().isString().withMessage('Notes must be text')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(req.body.vehicle_id);
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found' });
    }

    const record = await MaintenanceRecord.create(req.body);
    const recordWithVehicle = await MaintenanceRecord.findByPk(record.id, {
      include: [{ association: 'vehicle' }]
    });
    res.status(201).json(recordWithVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update maintenance record
router.put('/:id', [
  body('vehicle_id').optional().isInt().withMessage('Vehicle ID must be a valid integer'),
  body('service_date').optional().isDate().withMessage('Valid service date is required'),
  body('service_type').optional().isIn(['Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other']).withMessage('Invalid service type'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('next_service_date').optional().isDate().withMessage('Valid next service date is required'),
  body('notes').optional().isString().withMessage('Notes must be text')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await MaintenanceRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    await record.update(req.body);
    const updatedRecord = await MaintenanceRecord.findByPk(record.id, {
      include: [{ association: 'vehicle' }]
    });
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete maintenance record
router.delete('/:id', async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    await record.destroy();
    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get maintenance statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await MaintenanceRecord.count();
    
    // Get current month maintenance cost
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyCost = await MaintenanceRecord.sum('cost', {
      where: { service_date: { [Op.gte]: currentMonth } }
    }) || 0;

    // Get upcoming services (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const upcomingServices = await MaintenanceRecord.count({
      where: {
        next_service_date: {
          [Op.between]: [today, thirtyDaysLater]
        }
      }
    });

    // Get maintenance by type
    const maintenanceByType = await MaintenanceRecord.findAll({
      attributes: [
        'service_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('cost')), 'total_cost']
      ],
      group: ['service_type']
    });

    res.json({
      total,
      monthlyCost,
      upcomingServices,
      maintenanceByType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming services
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const upcomingServices = await MaintenanceRecord.findAll({
      where: {
        next_service_date: {
          [Op.between]: [today, thirtyDaysLater]
        }
      },
      include: [{ association: 'vehicle' }],
      order: [['next_service_date', 'ASC']]
    });

    res.json(upcomingServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
