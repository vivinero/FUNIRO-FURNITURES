const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(options) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: process.env.service,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
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
