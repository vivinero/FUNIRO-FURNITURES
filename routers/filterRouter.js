const express = require('express');
const filterProduct  = require('../controllers/filterController');
const { authenticate } = require('../middlewares/authentication');

// Create the router instance
const filterRouter = express.Router();

// Define the route with the middleware and controller
filterRouter.post('/filter', authenticate, filterProduct);

// Export the router
module.exports = filterRouter;
