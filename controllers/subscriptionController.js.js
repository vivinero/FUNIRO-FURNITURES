const subscriberModel = require('../models/subscriptionModel.js')
const sendEmail = require('../helpers/sendMail.js')
const config = require('../config/config.json')
const jwt = require('jsonwebtoken')



const subscribe = async (req, res) => {
    try {
        const { email } = req.body
        // check if the subscriber is already existing
        const exisitingSubscriber = await subscriberModel.findOne({ email })
        if (exisitingSubscriber) {
            return res.status(400).json({ message: 'Already Subscribed' })
        }

        // save the subscriber to the database
        const newSubscriber = new subscriberModel({ email })
        await newSubscriber.save()

        // generate a token for the new subscriber
        const secretKey = process.env.JWT_SECRET; 

        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });



        // Generate confirmation link (you could include a token if you want more security)
        const confirmationLink = `${req.protocol}://${req.get('host')}/confirm?token=${encodeURIComponent(token)}`;

        // Email options
        const mailOptions = {
            from: config.merchantEmail,
            to: email,
            subject: 'Confirm your subscription',
            html: `<p>Thank you for subscribing to our newsletter!</p>
                   <p>Please confirm your subscription by clicking the link below:</p>
                   <a href="${confirmationLink}">Confirm Subscription</a>`
        };
        await sendEmail(mailOptions);

        res.status(200).json({ message: 'You have successfully subscribed to our newsletter, kindly check your email for confirmation',token })

    } catch (err) {
        res.status(500).json({ message: 'Failed to subscribe. ' + err.message })
    }
}
module.exports = {subscribe}