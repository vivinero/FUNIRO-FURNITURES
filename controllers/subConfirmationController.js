const jwt = require('jsonwebtoken');
const Subscriber = require('../models/subscriptionModel.js'); 
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

const confirmSubscription = async (req, res) => {
    console.log('Confirm Subscription Route Hit');
    try {
        // Extract the token from the request parameter
        const { token } = req.params;
        console.log('Token received:', token);

        // If the token is not provided, send a 400 bad request message
        if (!token) {
            return res.status(400).send('No token provided.');
        }

        // Decode the token with the secretKey to identify the user
        const decoded = jwt.verify(token, secretKey);
        const email = decoded.email;

        console.log('email: ', email)

        // Find the subscriber by email
        const subscriber = await Subscriber.findOne({ email });
        console.log('subscriber found: ', subscriber)

        // Check if the subscriber exists
        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found.' });
        }

              // Confirm the subscription in the database and update confirmed to true
        const confirmation = await Subscriber.updateOne({ email }, { $set: { confirmed: true } });
        console.log(confirmation + 'confirmed')

              // After updating, redirect to the success page
              res.redirect('https://furniro-iota-eight.vercel.app/#/newsLetter-success');

        // Check if the subscription is already confirmed
        if (subscriber.confirmed === true) {
            // If already confirmed, redirect to success page
            return res.redirect('https://furniro-iota-eight.vercel.app/#/newsLetter-success');
        }

  
    } catch (error) {
        res.status(500).json('Invalid or expired token.' + error.message);
    }
}

module.exports = { confirmSubscription };
