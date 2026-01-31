const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateVehicle, validateId } = require('../middleware/validation');

// Public routes (with optional auth)
router.get('/stats', vehicleController.getVehicleStats);

// Protected routes
router.use(authenticateToken);

// Get all vehicles (accessible to all authenticated users)
router.get('/', vehicleController.getAllVehicles);

// Get vehicle by ID
router.get('/:id', validateId, vehicleController.getVehicleById);

// Admin/Manager only routes
router.post('/', 
  authorizeRoles('admin', 'manager'), 
  validateVehicle, 
  vehicleController.createVehicle
);

router.put('/:id', 
  authorizeRoles('admin', 'manager'), 
  validateId, 
  validateVehicle, 
  vehicleController.updateVehicle
);

router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  vehicleController.deleteVehicle
);

module.exports = router;
