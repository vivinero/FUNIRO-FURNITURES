const jwt = require('jsonwebtoken');
const Subscriber = require('../models/subsccriptionModel.js'); 
require('dotenv').config()

const secretKey = process.env.JWT_SECRET

const confirmSubscription = async (req, res) => {
    try{
        const { token } = req.query;

       if (!token) {
        return res.status(400).send('No token provided.');
      }

    
        const decoded = jwt.verify(token, secretKey);
        const email = decoded.email;

        // Confirm the subscription in the database
        await Subscriber.updateOne({ email }, { $set: { confirmed: true } });

        res.status(200).send(`Subscription confirmed for ${email}`);
    } catch (error) {
        res.status(400).send('Invalid or expired token.');
    }
}

module.exports = { confirmSubscription };
