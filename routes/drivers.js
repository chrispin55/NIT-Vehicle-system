const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driverController');
const { validateDriver, validateId } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/stats', driverController.getDriverStats);

// Get all drivers (no authentication required)
router.get('/', driverController.getAllDrivers);

// Get driver by ID (no authentication required)
router.get('/:id', validateId, driverController.getDriverById);

// Create driver (no authentication required)
router.post('/', validateDriver, driverController.createDriver);

// Update driver (no authentication required)
router.put('/:id', validateId, validateDriver, driverController.updateDriver);

// Delete driver (no authentication required)
router.delete('/:id', validateId, driverController.deleteDriver);

module.exports = router;
