const dynamicHtml=( link,firstName, lastName)=>{
  
    return `
  
  
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Reset Your Password - Furniro</title>
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f1f1;
            font-family: 'Lato', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 1em 2.5em;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 3em 0 2em;
        }
        .header img {
            max-width: 150px;
        }
        .header h3 {
            color: #B88E2F;
            font-size: 24px;
            margin-top: 1em;
        }
        .content {
            padding: 0 2.5em;
            text-align: center;
        }
        .content h2 {
            color: rgba(0, 0, 0, 0.8);
            font-size: 28px;
            margin-bottom: 1em;
            font-weight: 400;
        }
        .content h3 {
            font-size: 20px;
            font-weight: 300;
            margin-bottom: 2em;
            color: rgba(0, 0, 0, 0.6);
        }
        .btn-primary {
            padding: 15px 35px;
            display: inline-block;
            border-radius: 5px;
            background: #B88E2F;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            margin-top: 1.5em;
        }
        .btn-primary:hover {
            background: #A77C2B;
        }
        .footer {
            padding: 2.5em;
            background-color: #fafafa;
            text-align: left;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
        }
        .footer h3 {
            font-size: 18px;
            margin-top: 0;
            color: #000;
        }
        .footer ul {
            list-style-type: none;
            padding: 0;
        }
        .footer li {
            margin-bottom: 0.5em;
        }
        .footer li span {
            color: rgba(0, 0, 0, 0.5);
        }
        .copyright {
            text-align: center;
            background-color: #fafafa;
            padding: 1em;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <center style="width: 100%; background-color: #f1f1f1;">
        <div class="container">
            <div class="header">
                <img src="https://furniro-iota-eight.vercel.app/icons/logo.svg" alt="Furniro Logo">
                <h3>Furniro</h3>
            </div>
            <div class="content">
                <h2>Please Reset Your Password</h2>
                <h3>Dear ${firstName} ${lastName},<br>Click the button below to reset your password.</h3>
                <a href="${link}" class="btn-primary">Reset Password</a>
                <h6>This link will expire in 2 minutes.</h6>
            </div>
            <div class="footer">
                <div>
                    <h3>About</h3>
                    <p>Furniro is your go-to e-commerce platform for premium home and office furniture.</p>
                </div>
                <div>
                    <h3>Contact Info</h3>
                    <ul>
                        <li><span>161/163 Muyibi street, Olodi Apapa</span></li>
                        <li><span>081372586756</span></li>
                    </ul>
                </div>
                <div>
                    <h3>Useful Links</h3>
                    <ul>
                        <li><span><a href="https://furniro-iota-eight.vercel.app/#/">Home</a></span></li>
                        <li><span><a href="https://furniro-iota-eight.vercel.app/#/shop">Shop</a></span></li>
                        <li><span><a href="https://furniro-iota-eight.vercel.app/#/contact">Contact Us</a></span></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="copyright">
            © Copyright 2024. All rights reserved.
        </div>
    </center>
</body>
</html>
`
}
  
  module.exports = dynamicHtml