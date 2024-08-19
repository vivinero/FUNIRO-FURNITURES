// routers/contactUsRouter.js

const express = require('express');
const router = express.Router();
const {contactUs} = require('../controllers/contactUsController');

// Define the route with a callback function
router.post('/contact-us', contactUs);

module.exports = router;

