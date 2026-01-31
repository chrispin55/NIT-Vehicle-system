const express = require('express');
const router = express.Router();

const { pool } = require('../database/config');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateMaintenance, validateId, validateDateRange } = require('../middleware/validation');

// Get all maintenance records
router.get('/', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { vehicle_id, status, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT mr.*, 
             v.plate_number, 
             v.vehicle_type, 
             v.model
      FROM maintenance_records mr
      JOIN vehicles v ON mr.vehicle_id = v.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (vehicle_id) {
      query += ' AND mr.vehicle_id = ?';
      params.push(vehicle_id);
    }
    
    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    
    if (start_date) {
      query += ' AND mr.maintenance_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND mr.maintenance_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY mr.maintenance_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [records] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM maintenance_records WHERE 1=1';
    const countParams = [];
    
    if (vehicle_id) {
      countQuery += ' AND vehicle_id = ?';
      countParams.push(vehicle_id);
    }
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (start_date) {
      countQuery += ' AND maintenance_date >= ?';
      countParams.push(start_date);
    }
    
    if (end_date) {
      countQuery += ' AND maintenance_date <= ?';
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
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch maintenance records'
    });
  }
});

// Get maintenance record by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [records] = await pool.execute(`
      SELECT mr.*, 
             v.plate_number, 
             v.vehicle_type, 
             v.model,
             v.manufacture_year
      FROM maintenance_records mr
      JOIN vehicles v ON mr.vehicle_id = v.id
      WHERE mr.id = ?
    `, [id]);
    
    if (records.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Maintenance record not found'
      });
    }
    
    res.json(records[0]);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch maintenance record'
    });
  }
});

// Create new maintenance record
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'manager'), 
  validateMaintenance, 
  async (req, res) => {
    try {
      const {
        vehicle_id,
        maintenance_type,
        description,
        cost,
        maintenance_date,
        next_maintenance_date,
        mechanic_name,
        status = 'Scheduled'
      } = req.body;
      
      // Check if vehicle exists
      const [vehicleCheck] = await pool.execute(
        'SELECT id, plate_number FROM vehicles WHERE id = ?',
        [vehicle_id]
      );
      
      if (vehicleCheck.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Vehicle not found'
        });
      }
      
      const [result] = await pool.execute(`
        INSERT INTO maintenance_records (
          vehicle_id, maintenance_type, description, cost, maintenance_date,
          next_maintenance_date, mechanic_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        vehicle_id, maintenance_type, description, cost, maintenance_date,
        next_maintenance_date, mechanic_name, status
      ]);
      
      // Update vehicle's next maintenance date if provided
      if (next_maintenance_date) {
        await pool.execute(
          'UPDATE vehicles SET next_maintenance_date = ? WHERE id = ?',
          [next_maintenance_date, vehicle_id]
        );
      }
      
      // Return the created record
      const [newRecord] = await pool.execute(`
        SELECT mr.*, 
               v.plate_number, 
               v.vehicle_type, 
               v.model
        FROM maintenance_records mr
        JOIN vehicles v ON mr.vehicle_id = v.id
        WHERE mr.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Maintenance record created successfully',
        record: newRecord[0]
      });
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create maintenance record'
      });
    }
  }
);

// Update maintenance record
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'manager'), 
  validateId, 
  validateMaintenance, 
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
      
      // Check if record exists
      const [existing] = await pool.execute(
        'SELECT id, vehicle_id, status FROM maintenance_records WHERE id = ?',
        [id]
      );
      
      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Maintenance record not found'
        });
      }
      
      const record = existing[0];
      
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
        `UPDATE maintenance_records SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      
      // Update vehicle's next maintenance date if changed
      if (updateFields.next_maintenance_date) {
        await pool.execute(
          'UPDATE vehicles SET next_maintenance_date = ? WHERE id = ?',
          [updateFields.next_maintenance_date, record.vehicle_id]
        );
      }
      
      // If status changed to 'Completed', update vehicle status to 'Active'
      if (updateFields.status === 'Completed' && record.status !== 'Completed') {
        await pool.execute(
          'UPDATE vehicles SET status = "Active" WHERE id = ?',
          [record.vehicle_id]
        );
      }
      
      // Return updated record
      const [updatedRecord] = await pool.execute(`
        SELECT mr.*, 
               v.plate_number, 
               v.vehicle_type, 
               v.model
        FROM maintenance_records mr
        JOIN vehicles v ON mr.vehicle_id = v.id
        WHERE mr.id = ?
      `, [id]);
      
      res.json({
        message: 'Maintenance record updated successfully',
        record: updatedRecord[0]
      });
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update maintenance record'
      });
    }
  }
);

// Delete maintenance record
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin'), 
  validateId, 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if record exists
      const [existing] = await pool.execute(
        'SELECT id FROM maintenance_records WHERE id = ?',
        [id]
      );
      
      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Maintenance record not found'
        });
      }
      
      await pool.execute('DELETE FROM maintenance_records WHERE id = ?', [id]);
      
      res.json({
        message: 'Maintenance record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete maintenance record'
      });
    }
  }
);

// Get maintenance statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN maintenance_date <= CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'Completed' THEN 1 ELSE 0 END) as due_soon,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost
      FROM maintenance_records
    `);
    
    const [byType] = await pool.execute(`
      SELECT maintenance_type, COUNT(*) as count, SUM(cost) as total_cost
      FROM maintenance_records
      GROUP BY maintenance_type
      ORDER BY count DESC
    `);
    
    res.json({
      overview: stats[0],
      by_type: byType
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch maintenance statistics'
    });
  }
});

module.exports = router;
