const subRouter = require('express').Router()
const {subscribe} = require('../controllers/subscriptionController.js')

subRouter.post('/subscribe', subscribe)

module.exports = subRouter