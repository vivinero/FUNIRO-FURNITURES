const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(options) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.user,
            pass: process.env.emailPassWord,
        },
    });

    const mailOptions = {
        from: process.env.user,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { status: 'success', message: 'Verification email sent' };
    } catch (error) {
        return { status: 'error', message: 'Error sending verification email: ' + error.message };
    }
}

module.exports = { sendEmail };

// const nodemailer = require('nodemailer');
// require('dotenv').config();

// async function sendEmail(options) {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: process.env.service,
//             auth: {
//                 user: process.env.user, 
//                 pass: process.env.emailPassWord,
//             }
//         })
//             const mailOption = {
//               from: process.env.user,
//               to: options.email,
//               subject: options.subject,
//               text: options.text,
//               html: options.html
//             };
        
//             await transporter.sendMail(mailOption);   
//             return {
//                 success: true,
//                 message: 'Email sent successfully',
//             }
//     } catch (err) {
//         console.error('Error sending mail:', err.message);
//         return {
//             success: false,
//             message: 'Error sending mail: ' + err.message,
//         };
//     }
// }

// module.exports = {sendEmail};
