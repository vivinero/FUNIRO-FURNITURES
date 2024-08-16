// const contactUsModel = require('../models/contactUsModel.js')
// const sendEmail = require('../helpers/sendMail.js')

// const contactUs = async (req, res) => {
//     const {yourName, emailAddress, subject, message} = req.body

//         // check for missing fields
//         if(!yourName || !emailAddress || !subject || !message) {
//             return res.satus(400).json({message:'Missing required fields.'})
            
//         }

//         // email to merchant
//         const mailOptionsToMerchant = {
//         from:emailAddress,
//         to:process.env.merchantEmail,
//         subject: `Contact Us Message: ${subject}`,
//         text: `You have received a new message from ${yourName} (${emailAddress}):\n\n${message}`
//         }

//         // confirmation email to user
//         const mailOptionsToUser = {
//             from:process.env. merchantEmail,
//             to:emailAddress,
//             subject:'Thank You For Contacting Us',
//             text: `Hi ${yourName},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nFuniro-Funitures`

//         }
    
//     try {
//         // send email to merchant
//         await sendEmail(mailOptionsToMerchant)
//         // send confirmation email to user
//         await sendEmail(mailOptionsToUser)

//          res.status(200).json({ message: 'Message sent successfully, and confirmation email sent to user.' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ error: 'Failed to send message.' });
//     }
    

// }
// module.exports = {contactUs}


const contactUsModel = require('../models/contactUsModel.js');
const sendEmail = require('../helpers/sendMail.js');

const contactUs = async (req, res) => {
  const { yourName, emailAddress, subject, message } = req.body;

  // Check for missing fields
  if (!yourName || !emailAddress || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Email to merchant
  const mailOptionsToMerchant = {
    from: emailAddress,
    to: process.env.MERCHANT_EMAIL, // Ensure this is defined in your .env
    subject: `Contact Us Message: ${subject}`,
    text: `You have received a new message from ${yourName} (${emailAddress}):\n\n${message}`,
  };

  // Confirmation email to user
  const mailOptionsToUser = {
    from: process.env.MERCHANT_EMAIL, // Ensure this is defined in your .env
    to: emailAddress,
    subject: 'Thank You For Contacting Us',
    text: `Hi ${yourName},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nFuniro-Funitures`,
  };

  try {
    // Send email to merchant
    await sendEmail(mailOptionsToMerchant);
    // Send confirmation email to user
    await sendEmail(mailOptionsToUser);

    res.status(200).json({ message: 'Message sent successfully, and confirmation email sent to user.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message.' + error});
  }
};

module.exports = { contactUs };
