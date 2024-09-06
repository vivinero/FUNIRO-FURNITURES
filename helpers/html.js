const dynamicHtml = (otp, verificationLink) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>OTP Verification - Furniro</title>
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    <style>
        body {
            height: 100vh;
            margin: 0;
            padding: 0;
            background-color: #f1f1f1;
            font-family: 'Lato', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            height: max-content;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 2em;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            padding: 2em 0;
        }
        .header h2 {
            color: #B88E2F;
            font-size: 24px;
            margin-bottom: 0.5em;
        }
        .content {
            padding: 0 2.5em;
            text-align: center;
        }
        .content p {
            font-size: 18px;
            color: rgba(0, 0, 0, 0.7);
            margin-bottom: 1.5em;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #333333;
            margin-bottom: 1.5em;
        }
        .verify-button {
            padding: 15px 35px;
            border-radius: 5px;
            background-color: #B88E2F;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            margin-top: 1.5em;
            display: inline-block;
        }
        .verify-button:hover {
            background-color: #A77C2B;
        }
        .footer {
            padding-top: 2em;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
        }
        .footer p {
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <center style="width: 100%; background-color: #f1f1f1;">
        <div class="container">
            <div class="header">
                <h2>OTP Verification</h2>
            </div>
            <div class="content">
                <p>Your OTP code is:</p>
                <p class="otp-code"><strong>${otp}</strong></p>
                <p>Please use this code to verify your account. It is valid for 5 minutes.</p>
                <a href="https://furniro-iota-eight.vercel.app/#/otp" class="verify-button">Verify OTP</a>
            </div>
            <div class="footer">
                <p>If you did not request this OTP, please ignore this email.</p>
            </div>
        </div>
    </center>
</body>
</html>
`
}
module.exports = dynamicHtml;
