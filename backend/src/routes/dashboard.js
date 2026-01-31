const express = require('express');
const { Vehicle, Driver, Trip, MaintenanceRecord, FuelRecord } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Vehicle statistics
    const totalVehicles = await Vehicle.count();
    const activeVehicles = await Vehicle.count({ where: { status: 'Active' } });
    const maintenanceVehicles = await Vehicle.count({ where: { status: 'Under Maintenance' } });

    // Driver statistics
    const totalDrivers = await Driver.count();
    const activeDrivers = await Driver.count({ where: { status: 'Active' } });

    // Trip statistics
    const totalTrips = await Trip.count();
    const todayTrips = await Trip.count({
      where: { trip_date: new Date().toISOString().split('T')[0] }
    });
    const ongoingTrips = await Trip.count({ where: { status: 'In Progress' } });

    // Maintenance statistics
    const upcomingMaintenance = await MaintenanceRecord.count({
      where: {
        next_service_date: {
          [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      }
    });

    res.json({
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        inactive: totalVehicles - activeVehicles - maintenanceVehicles
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        inactive: totalDrivers - activeDrivers
      },
      trips: {
        total: totalTrips,
        today: todayTrips,
        ongoing: ongoingTrips,
        scheduled: await Trip.count({ where: { status: 'Scheduled' } }),
        completed: await Trip.count({ where: { status: 'Completed' } })
      },
      maintenance: {
        upcoming: upcomingMaintenance,
        thisMonth: await MaintenanceRecord.count({
          where: {
            service_date: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent trips
router.get('/recent-trips', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { association: 'driver', attributes: ['id', 'full_name', 'driver_id'] },
        { association: 'vehicle', attributes: ['id', 'plate_number', 'model'] }
      ],
      order: [['trip_date', 'DESC'], ['trip_time', 'DESC']],
      limit: 10
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly fuel cost analysis
router.get('/fuel-analysis', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const fuelData = await FuelRecord.findAll({
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('fuel_date')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_cost')), 'total_cost'],
        [require('sequelize').fn('SUM', require('sequelize').col('liters')), 'total_liters']
      ],
      where: {
        fuel_date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lte]: new Date(currentYear, 11, 31)
        }
      },
      group: [require('sequelize').fn('MONTH', require('sequelize').col('fuel_date'))],
      order: [[require('sequelize').fn('MONTH', require('sequelize').col('fuel_date')), 'ASC']]
    });

    // Format data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, index) => {
      const monthData = fuelData.find(d => d.dataValues.month === index + 1);
      return {
        month,
        cost: monthData ? parseFloat(monthData.dataValues.total_cost) : 0,
        liters: monthData ? parseFloat(monthData.dataValues.total_liters) : 0
      };
    });

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle status distribution
router.get('/vehicle-status', async (req, res) => {
  try {
    const statusData = await Vehicle.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    const distribution = {
      'Active': 0,
      'Under Maintenance': 0,
      'Inactive': 0
    };

    statusData.forEach(item => {
      distribution[item.status] = parseInt(item.dataValues.count);
    });

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get operational costs (monthly)
router.get('/operational-costs', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get monthly maintenance costs
    const maintenanceData = await MaintenanceRecord.findAll({
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('service_date')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('cost')), 'total_cost']
      ],
      where: {
        service_date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lte]: new Date(currentYear, 11, 31)
        }
      },
      group: [require('sequelize').fn('MONTH', require('sequelize').col('service_date'))],
      order: [[require('sequelize').fn('MONTH', require('sequelize').col('service_date')), 'ASC']]
    });

    // Get monthly fuel costs
    const fuelData = await FuelRecord.findAll({
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('fuel_date')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_cost')), 'total_cost']
      ],
      where: {
        fuel_date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lte]: new Date(currentYear, 11, 31)
        }
      },
      group: [require('sequelize').fn('MONTH', require('sequelize').col('fuel_date'))],
      order: [[require('sequelize').fn('MONTH', require('sequelize').col('fuel_date')), 'ASC']]
    });

    // Format data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, index) => {
      const maintenanceMonth = maintenanceData.find(d => d.dataValues.month === index + 1);
      const fuelMonth = fuelData.find(d => d.dataValues.month === index + 1);
      
      return {
        month,
        maintenanceCost: maintenanceMonth ? parseFloat(maintenanceMonth.dataValues.total_cost) : 0,
        fuelCost: fuelMonth ? parseFloat(fuelMonth.dataValues.total_cost) : 0
      };
    });

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary table data
router.get('/monthly-summary', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const summaryData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      // Get trips count for the month
      const tripsCount = await Trip.count({
        where: {
          trip_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Get fuel cost for the month
      const fuelCost = await FuelRecord.sum('total_cost', {
        where: {
          fuel_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;

      // Get maintenance cost for the month
      const maintenanceCost = await MaintenanceRecord.sum('cost', {
        where: {
          service_date: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;

      // Calculate vehicle utilization (simplified)
      const activeVehicles = await Vehicle.count({ where: { status: 'Active' } });
      const utilization = activeVehicles > 0 ? Math.min(100, Math.round((tripsCount / (activeVehicles * 20)) * 100)) : 0;

      summaryData.push({
        month: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        trips: tripsCount,
        fuelCost,
        maintenanceCost,
        operationalCost: fuelCost + maintenanceCost,
        utilization
      });
    }

    // Get last 3 months of data
    const recentData = summaryData.slice(-3).reverse();
    res.json(recentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
