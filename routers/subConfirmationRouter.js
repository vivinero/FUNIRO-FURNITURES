const express = require('express');
const subConfirmationRouter = express.Router();
const { confirmSubscription } = require('../controllers/subConfirmationController.js');

subConfirmationRouter.get('/confirm', confirmSubscription);

module.exports = subConfirmationRouter;
