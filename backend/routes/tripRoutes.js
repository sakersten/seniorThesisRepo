const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/', tripController.createTrip); // POST trips
router.get('/', tripController.getTrips);    // GET trips

module.exports = router;