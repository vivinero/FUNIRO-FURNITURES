const dynamicHtml=( otp, verificationLink)=> {
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                background-color: #ffffff;
                padding: 20px;
                margin: 0 auto;
                max-width: 600px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
            }
            .header h2 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .otp-code {
                font-size: 24px;
                color: #333333;
                margin: 20px 0;
            }
            .verify-button {
                background-color: #6a11cb;
                color: #ffffff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                text-decoration: none;
                font-size: 16px;
            }
            .verify-button:hover {
                background-color: #2575fc;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                color: #777777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>OTP Verification</h2>
            </div>
            <div class="content">
                <p>Your OTP code is:</p>
                <p class="otp-code"><strong>${otp}</strong></p>
                <p>Please use this code to verify your account. It is valid for 5 minutes.</p>
                <a href="${verificationLink}" class="verify-button">Verify OTP</a>
            </div>
            <div class="footer">
                <p>If you did not request this OTP, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
        `;
    }
module.exports =  dynamicHtml

