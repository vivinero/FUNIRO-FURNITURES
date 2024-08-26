const jwt = require('jsonwebtoken');
const Subscriber = require('../models/subscriptionModel.js'); 
require('dotenv').config()

const secretKey = process.env.JWT_SECRET

const confirmSubscription = async (req, res) => {
    try{
        // check if the token is provided in the request parameter
        const { token } = req.params;
        // if the token is not provided send a 400 bad request message
       if (!token) {
        return res.status(400).send('No token provided.');
      }

    //    if the token is provided proceed to decode the token with the secretKey to identify the user
        const decoded = jwt.verify(token, secretKey);
        const email = decoded.email;

        // Confirm the subscription in the database and update confirm to true
        await Subscriber.updateOne({ email }, { $set: { confirmed: true } });

        // send a 200 success messeage
        res.status(200).send(`Subscription confirmed for ${email}`);
    } catch (error) {
        res.status(500).send('Invalid or expired token.' + error.message);
    }
}

module.exports = { confirmSubscription };
