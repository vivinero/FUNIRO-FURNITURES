const express = require('express');
const filterProduct  = require('../controllers/filterController');
const { authenticate } = require('../middleWares/authentication');

// Create the router instance
const filterRouter = express.Router();

// Define the route with the middleware and controller
filterRouter.post('/filter', authenticate, filterProduct);
// how your url should look like
// Example: http://localhost:5000/filter?productName=Shirt&categoryName=Apparel

// Export the router
module.exports = filterRouter;
