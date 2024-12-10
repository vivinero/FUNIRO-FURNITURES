const express = require('express');
const airtime  = require('../controllers/airtime');
const { authenticate } = require('../middleWares/authentication');

// Create the router instance
const airtimeRouter = express.Router();

// Define the route with the middleware and controller
airtimeRouter.post('/airtime',  filterProduct);
// how your url should look like
// Example: http://localhost:5000/filter?productName=Shirt&categoryName=Apparel

// Export the router
module.exports = filterRouter;
