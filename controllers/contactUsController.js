const contactUsModel = require('../models/contactUsModel.js')

const contactUs = async (req, res) => {
    try {
        const {yourName, emailAddress, subject, message} = req.body

        // check for missing fields
        if(!yourName || !emailAddress || !subject || !message) {
            return res.satus(400).json({message:'Missing required fields, must fill all fields'})
        }
        const reachUs = await contactUsModel.create({
            yourName,
            emailAddress:email,
            subject,
            message
        })
        await reachUs.save()
        res.satus(200).json({message:'submitted Successfully, we will get back to you as soon as possible'})
            
    } catch (err) {
        res.satus(500).json({error:err.message})
    }
    

}
module.exports = contactUs