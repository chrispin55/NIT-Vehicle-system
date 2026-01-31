const express = require('express');
const router = express.Router();

const tripController = require('../controllers/tripController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateTrip, validateId, validateDateRange } = require('../middleware/validation');

// Public routes (with optional auth)
router.get('/stats', validateDateRange, tripController.getTripStats);

// Protected routes
router.use(authenticateToken);

// Get all trips (accessible to all authenticated users)
router.get('/', validateDateRange, tripController.getAllTrips);

// Get trip by ID
router.get('/:id', validateId, tripController.getTripById);

// Admin/Manager only routes
router.post('/', 
  authorizeRoles('admin', 'manager'), 
  validateTrip, 
  tripController.createTrip
);

router.put('/:id', 
  authorizeRoles('admin', 'manager'), 
  validateId, 
  validateTrip, 
  tripController.updateTrip
);

router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  tripController.deleteTrip
);

module.exports = router;
