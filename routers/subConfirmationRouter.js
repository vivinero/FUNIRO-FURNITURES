const express = require('express');
const subConfirmationRouter = express.Router();
const { confirmSubscription } = require('../controllers/subConfirmationController.js');

subConfirmationRouter.post('/confirm/:token', confirmSubscription);

module.exports = subConfirmationRouter;
