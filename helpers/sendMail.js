const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: process.env.service,
    auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
    },

})

    
  
 // function to send email
 const sendEmail = async(mailOptions)=>{
    try{
        await transporter.sendMail(mailOptions)
    }catch(error){
        throw new Error('Failed to send email: ' + error.message);
    }
    // console.log('Email sent: ' + info.response);
}
module.exports=sendEmail