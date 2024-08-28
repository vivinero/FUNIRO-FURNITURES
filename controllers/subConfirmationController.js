const jwt = require('jsonwebtoken');
const Subscriber = require('../models/subscriptionModel.js'); 
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

const confirmSubscription = async (req, res) => {
    try {
        // Extract the token from the request parameter
        const { token } = req.params;

        // If the token is not provided, send a 400 bad request message
        if (!token) {
            return res.status(400).send('No token provided.');
        }

        // Decode the token with the secretKey to identify the user
        const decoded = jwt.verify(token, secretKey);
        const email = decoded.email;

        // Find the subscriber by email
        const subscriber = await Subscriber.findOne({ email });

        // Check if the subscriber exists
        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found.' });
        }

        // Check if the subscription is already confirmed
        if (subscriber.confirmed === true) {
            // If already confirmed, redirect to success page
            return res.redirect('https://furniro-iota-eight.vercel.app/#/newsLetter-success');
        }

        // Confirm the subscription in the database and update confirmed to true
        await Subscriber.updateOne({ email }, { $set: { confirmed: true } });

        // After updating, redirect to the success page
        res.redirect('https://furniro-iota-eight.vercel.app/#/newsLetter-success');
    } catch (error) {
        res.status(500).send('Invalid or expired token.' + error.message);
    }
}

module.exports = { confirmSubscription };
