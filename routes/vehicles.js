const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicleController');
const { validateVehicle, validateId } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/stats', vehicleController.getVehicleStats);

// Get all vehicles (no authentication required)
router.get('/', vehicleController.getAllVehicles);

// Get vehicle by ID (no authentication required)
router.get('/:id', validateId, vehicleController.getVehicleById);

// Create vehicle (no authentication required)
router.post('/', validateVehicle, vehicleController.createVehicle);

// Update vehicle (no authentication required)
router.put('/:id', validateId, validateVehicle, vehicleController.updateVehicle);

// Delete vehicle (no authentication required)
router.delete('/:id', validateId, vehicleController.deleteVehicle);

module.exports = router;
