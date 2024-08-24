const express = require('express');
const locationController = require('../controllers/locationController');
const router = express.Router();

router.get('/countries', locationController.getAllCountries);

router.get('/countries/:countryName/states', locationController.getStatesByCountry);

router.get('/countries/:countryName/states/:stateName/cities', locationController.getCitiesByState);


module.exports = router;
