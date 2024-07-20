const dynamicHtml = (otp, verificationLink) => {
    return `
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
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
                text-align: center;
            }
            .header {
                margin-bottom: 20px;
            }
            .header h2 {
                margin: 0;
                color: #333333;
            }
            .content {
                margin-bottom: 20px;
            }
            .otp-code {
                font-size: 24px;
                color: #333333;
                margin: 20px 0;
            }
            .otp-input {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            .otp-input input {
                width: 40px;
                height: 50px;
                font-size: 24px;
                text-align: center;
                border: 2px solid #ddd;
                border-radius: 5px;
            }
            .otp-input input:focus {
                border-color: #6a11cb;
                outline: none;
                box-shadow: 0 0 5px rgba(106, 17, 203, 0.5);
            }
            .verify-button {
                background-color: #6a11cb;
                color: #ffffff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                text-decoration: none;
                font-size: 16px;
                cursor: pointer;
            }
            .verify-button:hover {
                background-color: #2575fc;
            }
            .footer {
                color: #777777;
                font-size: 14px;
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
                <form action="${verificationLink}" method="GET">
                    <div class="otp-input">
                        <input type="text" name="otp1" maxlength="1" required>
                        <input type="text" name="otp2" maxlength="1" required>
                        <input type="text" name="otp3" maxlength="1" required>
                        <input type="text" name="otp4" maxlength="1" required>
                        <input type="text" name="otp5" maxlength="1" required>
                        <input type="text" name="otp6" maxlength="1" required>
                    </div>
                    <button type="submit" class="verify-button">Verify OTP</button>
                </form>
            </div>
            <div class="footer">
                <p>If you did not request this OTP, please ignore this email.</p>
            </div>
        </div>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const inputs = document.querySelectorAll('.otp-input input');
                inputs.forEach((input, index) => {
                    input.addEventListener('keyup', (e) => {
                        if (e.key >= '0' && e.key <= '9') {
                            if (index < inputs.length - 1) {
                                inputs[index + 1].focus();
                            }
                        } else if (e.key === 'Backspace') {
                            if (index > 0) {
                                inputs[index - 1].focus();
                            }
                        }
                    });
                });
            });
        </script>
    </body>
    </html>
    `;
}
module.exports = dynamicHtml;
