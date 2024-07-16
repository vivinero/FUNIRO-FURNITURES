const express = require('express');
const contactUs = require('../controllers/contactUsController');
// const { authenticate } = require('../middlewares/authentication');

// Create the router instance
const contactUsRouter = express.Router();

// Define the route with the middleware and controller
contactUsRouter.post('/contact-us', contactUs);

// Export the router
module.exports = contactUsRouter;
