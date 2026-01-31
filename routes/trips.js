const express = require('express');
const router = express.Router();

const tripController = require('../controllers/tripController');
const { validateTrip, validateId, validateDateRange } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/stats', tripController.getTripStats);

// Get all trips (no authentication required)
router.get('/', tripController.getAllTrips);

// Get trip by ID (no authentication required)
router.get('/:id', validateId, tripController.getTripById);

// Create trip (no authentication required)
router.post('/', validateTrip, tripController.createTrip);

// Update trip (no authentication required)
router.put('/:id', validateId, validateTrip, tripController.updateTrip);

// Delete trip (no authentication required)
router.delete('/:id', validateId, tripController.deleteTrip);

module.exports = router;
