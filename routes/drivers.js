const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driverController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDriver, validateId } = require('../middleware/validation');

// Public routes (with optional auth)
router.get('/stats', driverController.getDriverStats);

// Protected routes
router.use(authenticateToken);

// Get all drivers (accessible to all authenticated users)
router.get('/', driverController.getAllDrivers);

// Get driver by ID
router.get('/:id', validateId, driverController.getDriverById);

// Admin/Manager only routes
router.post('/', 
  authorizeRoles('admin', 'manager'), 
  validateDriver, 
  driverController.createDriver
);

router.put('/:id', 
  authorizeRoles('admin', 'manager'), 
  validateId, 
  validateDriver, 
  driverController.updateDriver
);

router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  driverController.deleteDriver
);

module.exports = router;
