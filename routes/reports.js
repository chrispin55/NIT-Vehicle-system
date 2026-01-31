const express = require('express');
const router = express.Router();

const { pool } = require('../database/config');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDateRange } = require('../middleware/validation');

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get vehicle statistics
    const [vehicleStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_vehicles,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive_vehicles
      FROM vehicles
    `);
    
    // Get driver statistics
    const [driverStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_drivers,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_drivers,
        SUM(CASE WHEN assigned_vehicle_id IS NOT NULL THEN 1 ELSE 0 END) as assigned_drivers
      FROM drivers
    `);
    
    // Get trip statistics
    const [tripStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_trips,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled_trips,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as ongoing_trips,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(passenger_count) as total_passengers,
        SUM(distance_km) as total_distance
      FROM trips
    `);
    
    // Get maintenance statistics
    const [maintenanceStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_maintenance,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled_maintenance,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_maintenance,
        SUM(cost) as total_maintenance_cost
      FROM maintenance_records
    `);
    
    // Get fuel statistics
    const [fuelStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_fuel_records,
        SUM(quantity_liters) as total_fuel_consumed,
        SUM(total_cost) as total_fuel_cost,
        AVG(cost_per_liter) as avg_fuel_cost_per_liter
      FROM fuel_records
    `);
    
    // Get recent trips
    const [recentTrips] = await pool.execute(`
      SELECT 
        t.id,
        CONCAT(t.route_from, ' → ', t.route_to) as route,
        d.full_name as driver_name,
        v.plate_number,
        t.trip_date,
        t.status
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      ORDER BY t.trip_date DESC, t.departure_time DESC
      LIMIT 10
    `);
    
    res.json({
      vehicles: vehicleStats[0],
      drivers: driverStats[0],
      trips: tripStats[0],
      maintenance: maintenanceStats[0],
      fuel: fuelStats[0],
      recent_trips: recentTrips
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get vehicle utilization report
router.get('/vehicle-utilization', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE t.trip_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [utilization] = await pool.execute(`
      SELECT 
        v.id,
        v.plate_number,
        v.vehicle_type,
        v.capacity,
        COUNT(t.id) as total_trips,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(t.distance_km) as total_distance,
        SUM(t.passenger_count) as total_passengers,
        SUM(t.fuel_consumed) as total_fuel_consumed,
        AVG(t.passenger_count) as avg_passengers_per_trip,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100, 2)
        END as completion_rate
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id ${dateFilter.replace('WHERE', 'AND')}
      GROUP BY v.id, v.plate_number, v.vehicle_type, v.capacity
      ORDER BY total_trips DESC
    `, params);
    
    res.json({
      utilization_data: utilization,
      report_period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle utilization report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch vehicle utilization report'
    });
  }
});

// Get driver performance report
router.get('/driver-performance', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE t.trip_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const [performance] = await pool.execute(`
      SELECT 
        d.id,
        d.full_name,
        d.experience_years,
        v.plate_number as assigned_vehicle,
        COUNT(t.id) as total_trips,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(t.distance_km) as total_distance,
        SUM(t.passenger_count) as total_passengers,
        SUM(t.fuel_consumed) as total_fuel_consumed,
        AVG(t.distance_km) as avg_distance_per_trip,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100, 2)
        END as completion_rate
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      LEFT JOIN trips t ON d.id = t.driver_id ${dateFilter.replace('WHERE', 'AND')}
      GROUP BY d.id, d.full_name, d.experience_years, v.plate_number
      ORDER BY completed_trips DESC
    `, params);
    
    res.json({
      performance_data: performance,
      report_period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (error) {
    console.error('Error fetching driver performance report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch driver performance report'
    });
  }
});

// Get cost analysis report
router.get('/cost-analysis', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Fuel costs
    const [fuelCosts] = await pool.execute(`
      SELECT 
        SUM(total_cost) as total_fuel_cost,
        AVG(cost_per_liter) as avg_cost_per_liter,
        SUM(quantity_liters) as total_liters
      FROM fuel_records 
      ${dateFilter.replace('date', 'fuel_date')}
    `, params);
    
    // Maintenance costs
    const [maintenanceCosts] = await pool.execute(`
      SELECT 
        SUM(cost) as total_maintenance_cost,
        COUNT(*) as maintenance_count,
        AVG(cost) as avg_maintenance_cost
      FROM maintenance_records 
      ${dateFilter.replace('date', 'maintenance_date')}
    `, params);
    
    // Monthly cost trend
    const [monthlyTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(fuel_cost) as fuel_cost,
        SUM(maintenance_cost) as maintenance_cost,
        SUM(fuel_cost + maintenance_cost) as total_cost
      FROM (
        SELECT fuel_date as date, total_cost as fuel_cost, 0 as maintenance_cost
        FROM fuel_records
        UNION ALL
        SELECT maintenance_date as date, 0 as fuel_cost, cost as maintenance_cost
        FROM maintenance_records
      ) combined_costs
      ${dateFilter}
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, params);
    
    // Cost by vehicle
    const [costByVehicle] = await pool.execute(`
      SELECT 
        v.plate_number,
        v.vehicle_type,
        COALESCE(SUM(fr.total_cost), 0) as fuel_cost,
        COALESCE(SUM(mr.cost), 0) as maintenance_cost,
        COALESCE(SUM(fr.total_cost), 0) + COALESCE(SUM(mr.cost), 0) as total_cost
      FROM vehicles v
      LEFT JOIN fuel_records fr ON v.id = fr.vehicle_id ${dateFilter.replace('date', 'fr.fuel_date').replace('WHERE', 'AND')}
      LEFT JOIN maintenance_records mr ON v.id = mr.vehicle_id ${dateFilter.replace('date', 'mr.maintenance_date').replace('WHERE', 'AND')}
      GROUP BY v.id, v.plate_number, v.vehicle_type
      HAVING total_cost > 0
      ORDER BY total_cost DESC
      LIMIT 10
    `, params);
    
    res.json({
      fuel_costs: fuelCosts[0],
      maintenance_costs: maintenanceCosts[0],
      monthly_trend: monthlyTrend,
      cost_by_vehicle: costByVehicle,
      report_period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (error) {
    console.error('Error fetching cost analysis report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cost analysis report'
    });
  }
});

// Get trip analytics
router.get('/trip-analytics', authenticateToken, validateDateRange, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE trip_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Trip status distribution
    const [statusDistribution] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM trips ${dateFilter})), 2) as percentage
      FROM trips 
      ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `, params);
    
    // Popular routes
    const [popularRoutes] = await pool.execute(`
      SELECT 
        CONCAT(route_from, ' → ', route_to) as route,
        COUNT(*) as trip_count,
        AVG(distance_km) as avg_distance,
        SUM(passenger_count) as total_passengers
      FROM trips 
      ${dateFilter}
      GROUP BY route_from, route_to
      ORDER BY trip_count DESC
      LIMIT 10
    `, params);
    
    // Monthly trip trends
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(trip_date, '%Y-%m') as month,
        COUNT(*) as total_trips,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(distance_km) as total_distance,
        SUM(passenger_count) as total_passengers,
        AVG(distance_km) as avg_distance
      FROM trips 
      ${dateFilter}
      GROUP BY DATE_FORMAT(trip_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, params);
    
    res.json({
      status_distribution: statusDistribution,
      popular_routes: popularRoutes,
      monthly_trends: monthlyTrends,
      report_period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (error) {
    console.error('Error fetching trip analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch trip analytics'
    });
  }
});

// Export data (CSV format)
router.get('/export/:type', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { type } = req.params;
    const { start_date, end_date } = req.query;
    
    let query = '';
    let filename = '';
    
    switch (type) {
      case 'vehicles':
        query = 'SELECT * FROM vehicles ORDER BY plate_number';
        filename = 'vehicles_export.csv';
        break;
      case 'drivers':
        query = `
          SELECT d.*, v.plate_number as assigned_vehicle_plate 
          FROM drivers d 
          LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id 
          ORDER BY d.full_name
        `;
        filename = 'drivers_export.csv';
        break;
      case 'trips':
        query = `
          SELECT t.*, d.full_name as driver_name, v.plate_number as vehicle_plate
          FROM trips t
          JOIN drivers d ON t.driver_id = d.id
          JOIN vehicles v ON t.vehicle_id = v.id
          ${start_date && end_date ? 'WHERE t.trip_date BETWEEN ? AND ?' : ''}
          ORDER BY t.trip_date DESC
        `;
        filename = 'trips_export.csv';
        break;
      case 'maintenance':
        query = `
          SELECT mr.*, v.plate_number as vehicle_plate
          FROM maintenance_records mr
          JOIN vehicles v ON mr.vehicle_id = v.id
          ${start_date && end_date ? 'WHERE mr.maintenance_date BETWEEN ? AND ?' : ''}
          ORDER BY mr.maintenance_date DESC
        `;
        filename = 'maintenance_export.csv';
        break;
      case 'fuel':
        query = `
          SELECT fr.*, v.plate_number as vehicle_plate, d.full_name as driver_name
          FROM fuel_records fr
          JOIN vehicles v ON fr.vehicle_id = v.id
          LEFT JOIN drivers d ON fr.driver_id = d.id
          ${start_date && end_date ? 'WHERE fr.fuel_date BETWEEN ? AND ?' : ''}
          ORDER BY fr.fuel_date DESC
        `;
        filename = 'fuel_export.csv';
        break;
      default:
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid export type'
        });
    }
    
    const params = [];
    if (start_date && end_date && (type === 'trips' || type === 'maintenance' || type === 'fuel')) {
      params.push(start_date, end_date);
    }
    
    const [data] = await pool.execute(query, params);
    
    if (data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No data found for export'
      });
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle null values and escape commas
          return value === null ? '' : `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to export data'
    });
  }
});

module.exports = router;
