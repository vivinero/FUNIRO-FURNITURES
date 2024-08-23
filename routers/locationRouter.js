const express = require('express');
const locationController = require('../controllers/locationController');
const router = express.Router();

router.get('/countries', locationController.getAllCountries);
router.get('/countries/:countryCode/states', locationController.getStatesByCountry);
router.get('/countries/:countryCode/states/:isoCode/cities', locationController.getCitiesByState);

module.exports = router;
