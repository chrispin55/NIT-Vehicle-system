const express = require('express');
const router = express.Router();

const { pool } = require('../database/config');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateFuelRecord, validateId, validateDateRange } = require('../middleware/validation');

// Get all fuel records
router.get('/', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { vehicle_id, driver_id, fuel_type, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT fr.*, 
             v.plate_number, 
             v.vehicle_type, 
             v.model,
             d.full_name as driver_name
      FROM fuel_records fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      LEFT JOIN drivers d ON fr.driver_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (vehicle_id) {
      query += ' AND fr.vehicle_id = ?';
      params.push(vehicle_id);
    }
    
    if (driver_id) {
      query += ' AND fr.driver_id = ?';
      params.push(driver_id);
    }
    
    if (fuel_type) {
      query += ' AND fr.fuel_type = ?';
      params.push(fuel_type);
    }
    
    if (start_date) {
      query += ' AND fr.fuel_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND fr.fuel_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY fr.fuel_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [records] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM fuel_records WHERE 1=1';
    const countParams = [];
    
    if (vehicle_id) {
      countQuery += ' AND vehicle_id = ?';
      countParams.push(vehicle_id);
    }
    
    if (driver_id) {
      countQuery += ' AND driver_id = ?';
      countParams.push(driver_id);
    }
    
    if (fuel_type) {
      countQuery += ' AND fuel_type = ?';
      countParams.push(fuel_type);
    }
    
    if (start_date) {
      countQuery += ' AND fuel_date >= ?';
      countParams.push(start_date);
    }
    
    if (end_date) {
      countQuery += ' AND fuel_date <= ?';
      countParams.push(end_date);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fuel records:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch fuel records'
    });
  }
});

// Get fuel record by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [records] = await pool.execute(`
      SELECT fr.*, 
             v.plate_number, 
             v.vehicle_type, 
             v.model,
             v.fuel_type as vehicle_fuel_type,
             d.full_name as driver_name,
             d.phone_number as driver_phone
      FROM fuel_records fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      LEFT JOIN drivers d ON fr.driver_id = d.id
      WHERE fr.id = ?
    `, [id]);
    
    if (records.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Fuel record not found'
      });
    }
    
    res.json(records[0]);
  } catch (error) {
    console.error('Error fetching fuel record:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch fuel record'
    });
  }
});

// Create new fuel record
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'manager', 'driver'), 
  validateFuelRecord, 
  async (req, res) => {
    try {
      const {
        vehicle_id,
        fuel_date,
        fuel_type,
        quantity_liters,
        cost_per_liter,
        total_cost,
        odometer_reading,
        driver_id
      } = req.body;
      
      // Check if vehicle exists
      const [vehicleCheck] = await pool.execute(
        'SELECT id, plate_number, fuel_type FROM vehicles WHERE id = ?',
        [vehicle_id]
      );
      
      if (vehicleCheck.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Vehicle not found'
        });
      }
      
      // If driver_id is provided, check if driver exists
      if (driver_id) {
        const [driverCheck] = await pool.execute(
          'SELECT id, full_name FROM drivers WHERE id = ?',
          [driver_id]
        );
        
        if (driverCheck.length === 0) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Driver not found'
          });
        }
      }
      
      // Calculate total_cost if not provided
      const calculatedTotalCost = total_cost || (quantity_liters * cost_per_liter);
      
      const [result] = await pool.execute(`
        INSERT INTO fuel_records (
          vehicle_id, fuel_date, fuel_type, quantity_liters, cost_per_liter,
          total_cost, odometer_reading, driver_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        vehicle_id, fuel_date, fuel_type, quantity_liters, cost_per_liter,
        calculatedTotalCost, odometer_reading, driver_id
      ]);
      
      // Return the created record
      const [newRecord] = await pool.execute(`
        SELECT fr.*, 
               v.plate_number, 
               v.vehicle_type, 
               v.model,
               d.full_name as driver_name
        FROM fuel_records fr
        JOIN vehicles v ON fr.vehicle_id = v.id
        LEFT JOIN drivers d ON fr.driver_id = d.id
        WHERE fr.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Fuel record created successfully',
        record: newRecord[0]
      });
    } catch (error) {
      console.error('Error creating fuel record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create fuel record'
      });
    }
  }
);

// Update fuel record
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'manager'), 
  validateId, 
  validateFuelRecord, 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
      
      // Check if record exists
      const [existing] = await pool.execute(
        'SELECT id FROM fuel_records WHERE id = ?',
        [id]
      );
      
      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Fuel record not found'
        });
      }
      
      // If driver_id is being updated, check if driver exists
      if (updateFields.driver_id) {
        const [driverCheck] = await pool.execute(
          'SELECT id FROM drivers WHERE id = ?',
          [updateFields.driver_id]
        );
        
        if (driverCheck.length === 0) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Driver not found'
          });
        }
      }
      
      // Calculate total_cost if quantity_liters or cost_per_liter is being updated
      if (updateFields.quantity_liters !== undefined || updateFields.cost_per_liter !== undefined) {
        const [currentRecord] = await pool.execute(
          'SELECT quantity_liters, cost_per_liter FROM fuel_records WHERE id = ?',
          [id]
        );
        
        const quantity = updateFields.quantity_liters || currentRecord[0].quantity_liters;
        const costPerLiter = updateFields.cost_per_liter || currentRecord[0].cost_per_liter;
        updateFields.total_cost = quantity * costPerLiter;
      }
      
      // Build dynamic update query
      const fields = Object.keys(updateFields);
      const values = Object.values(updateFields);
      
      if (fields.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No fields to update'
        });
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await pool.execute(
        `UPDATE fuel_records SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      // Return updated record
      const [updatedRecord] = await pool.execute(`
        SELECT fr.*, 
               v.plate_number, 
               v.vehicle_type, 
               v.model,
               d.full_name as driver_name
        FROM fuel_records fr
        JOIN vehicles v ON fr.vehicle_id = v.id
        LEFT JOIN drivers d ON fr.driver_id = d.id
        WHERE fr.id = ?
      `, [id]);
      
      res.json({
        message: 'Fuel record updated successfully',
        record: updatedRecord[0]
      });
    } catch (error) {
      console.error('Error updating fuel record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update fuel record'
      });
    }
  }
);

// Delete fuel record
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  validateId, 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if record exists
      const [existing] = await pool.execute(
        'SELECT id FROM fuel_records WHERE id = ?',
        [id]
      );
      
      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Fuel record not found'
        });
      }
      
      await pool.execute('DELETE FROM fuel_records WHERE id = ?', [id]);
      
      res.json({
        message: 'Fuel record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting fuel record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete fuel record'
      });
    }
  }
);

// Get fuel statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE fuel_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(quantity_liters) as total_quantity,
        SUM(total_cost) as total_cost,
        AVG(cost_per_liter) as avg_cost_per_liter,
        AVG(quantity_liters) as avg_quantity_per_fill,
        MAX(odometer_reading) as max_odometer
      FROM fuel_records 
      ${dateFilter}
    `, params);
    
    const [byFuelType] = await pool.execute(`
      SELECT 
        fuel_type, 
        COUNT(*) as record_count,
        SUM(quantity_liters) as total_quantity,
        SUM(total_cost) as total_cost,
        AVG(cost_per_liter) as avg_cost_per_liter
      FROM fuel_records 
      ${dateFilter}
      GROUP BY fuel_type
      ORDER BY total_cost DESC
    `, params);
    
    const [byVehicle] = await pool.execute(`
      SELECT 
        v.plate_number,
        v.vehicle_type,
        COUNT(fr.id) as record_count,
        SUM(fr.quantity_liters) as total_quantity,
        SUM(fr.total_cost) as total_cost,
        AVG(fr.cost_per_liter) as avg_cost_per_liter
      FROM fuel_records fr
      JOIN vehicles v ON fr.vehicle_id = v.id
      ${dateFilter.replace('WHERE', 'WHERE fr.fuel_date')}
      GROUP BY fr.vehicle_id, v.plate_number, v.vehicle_type
      ORDER BY total_cost DESC
      LIMIT 10
    `, params);
    
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(fuel_date, '%Y-%m') as month,
        COUNT(*) as record_count,
        SUM(quantity_liters) as total_quantity,
        SUM(total_cost) as total_cost,
        AVG(cost_per_liter) as avg_cost_per_liter
      FROM fuel_records 
      ${dateFilter}
      GROUP BY DATE_FORMAT(fuel_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, params);
    
    res.json({
      overview: stats[0],
      by_fuel_type: byFuelType,
      by_vehicle: byVehicle,
      monthly_trend: monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching fuel stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch fuel statistics'
    });
  }
});

module.exports = router;
