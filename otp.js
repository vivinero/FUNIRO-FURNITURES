const generateOTPEmail = (otp, firstName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            h1 {
                color: #333;
            }
            p {
                font-size: 16px;
                color: #666;
                margin: 10px 0;
            }
            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #2C7DA0;
                margin: 20px 0;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>OTP Verification</h1>
            <p>Hi ${firstName},</p>
            <p>Your One-Time Password (OTP) for verification is:</p>
            <div class="otp">${otp}</div>
            <p>Please use this OTP to complete your verification process. This OTP is valid for the next 5 minutes.</p>
            <p class="footer">If you did not request this, please ignore this email.</p>
        </div>
    </body>
    </html>
    `;
}

module.exports = generateOTPEmail;
