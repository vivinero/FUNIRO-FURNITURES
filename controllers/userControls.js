const userModel = require('../models/userModel'); 
const otpGenerator = require('otp-generator');
const bcryptjs = require('bcryptjs');
const jwtSecret = process.env.JWT_SECRET; // Change this to a secure secret in production
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../helpers/mail'); 
const dynamicHtml = require('../helpers/html')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const port = process.env.port
require("dotenv").config()
// const TwitterStrategy = require('passport-twitter').Strategy;

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user._id); // Serialize the user by their unique MongoDB ID
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
});


// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLECALLBACKURL,
    passReqToCallback: true,
  },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists
        const existingUser = await userModel.findOne({ email: profile.emails[0].value });
  
        if (existingUser) {
          return done(null, existingUser); // Existing user found
        }
  
        // Create a new user
        const newUser = new userModel({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          isVerified: true, // Assume email is verified if using Google
        });
  
        await newUser.save(); // Save the new user
        done(null, newUser); // Return new user
      } catch (err) {
        done(err, null);
      }
    }
  ));




//otp verification time
const OTP_EXPIRATION_TIME = 60 * 60 * 36000; // 5 minutes in milliseconds
// const signUp = async (req, res) => {
//     try {
//         const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

//         const emailExist = await userModel.findOne({ email });
//         if (emailExist) {
//             return res.status(404).json({
//                 error: "User already exists"
//             });
//         }

//         if (confirmPassword !== password) {
//             return res.status(400).json({
//                 error: "Password mismatch"
//             });
//         }

//         const salt = bcryptjs.genSaltSync(12);
//         const hash = bcryptjs.hashSync(password, salt);

//         // Register the newuser
//         const newUser = await userModel.create({
//             firstName: firstName.toLowerCase(),
//             lastName: lastName.toLowerCase(),
//             email: email.toLowerCase(),
//             password: hash,
//             phoneNumber,
//             confirmPassword: hash
//         });

//         // Generate and send OTP to the user
//         const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
//         const hashOTP = bcryptjs.hashSync(otp, salt);
//         newUser.otp = hashOTP;
//         newUser.otpExpires = Date.now() + OTP_EXPIRATION_TIME;
//         try {
//             await newUser.save(); 
//         } catch (error) {
//             console.error('Error saving user:', error);
//         }

//         const verificationLink = `https://furniro-iota-eight.vercel.app/#/otp${otp}&email=${email}`;

//         const emailOptions = {
//             email: email,
//             subject: "Your OTP code",
//             text: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
//             html: dynamicHtml(otp, verificationLink),
//         };

//         const emailResult = await sendEmail(emailOptions);
//         if (emailResult.status === 'error') {
//             return res.status(500).json({ error: emailResult.message });
//         }

//         const token = jwt.sign({
//             userId: newUser._id,
//             email: newUser.email,
//             firstName: newUser.firstName,
//             lastName: newUser.lastName,
//         }, process.env.JWT_SECRET, { expiresIn: "6000s" });

//         console.log('Generated Token:', token);
//         res.status(200).json({
//             message: `Hello, ${newUser.firstName}. Your account has been successfully created and an OTP has been sent to your email.`,
//             data: newUser,
//             token
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };

const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

        const emailExist = await userModel.findOne({ email });
        if (emailExist) {
            return res.status(404).json({
                error: "User already exists"
            });
        }

        if (confirmPassword !== password) {
            return res.status(400).json({
                error: "Password mismatch"
            });
        }

        const salt = bcryptjs.genSaltSync(12);
        const hash = bcryptjs.hashSync(password, salt);

        // Register the new user
        const newUser = await userModel.create({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            email: email.toLowerCase(),
            password: hash,
            phoneNumber,
            confirmPassword: hash
        });

        // Generate and send OTP to the user
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const hashOTP = bcryptjs.hashSync(otp, salt);
        newUser.otp = hashOTP;
        newUser.otpExpires = Date.now() + OTP_EXPIRATION_TIME;

        console.log('Generated OTP:', otp); // Log generated OTP
        console.log('Hashed OTP:', hashOTP); // Log hashed OTP

        try {
            await newUser.save(); 
        } catch (error) {
            console.error('Error saving user:', error);
        }

        // Email and token generation logic here...
        const verificationLink = `https://furniro-iota-eight.vercel.app/#/otp${otp}&email=${email}`;

        const emailOptions = {
            email: email,
            subject: "Your OTP code",
            text: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
            html: dynamicHtml(otp, verificationLink),
        };

        const emailResult = await sendEmail(emailOptions);
        if (emailResult.status === 'error') {
            return res.status(500).json({ error: emailResult.message });
        }

        const token = jwt.sign({
            userId: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        }, process.env.JWT_SECRET, { expiresIn: "1hr" });
        // Save the token to the database
         newUser.token = token;
         await newUser.save();
        console.log('Generated Token:', token);
        console.log('New User Before Save:', newUser)
        res.status(200).json({
            message: `Hello, ${newUser.firstName}. Your account has been successfully created and an OTP has been sent to your email.`,
            data: newUser,
            token
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



const verifyOTP = async (req, res) => {
    console.log("Starting OTP verification...");
    try {
        const id = req.params
        const myId = id.id
        const { otp } = req.body;
        console.log("This is Id", myId)
        if (!otp) {
            return res.status(400).json({
                error: 'Email and OTP are required'
            });
        }

        // Find user by email
        const user = await userModel.findById(myId);
        console.log("This is user", user);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        // console.log('Retrieved User:', user); // Log the user object to inspect it
        // console.log('Stored OTP hash for user:', user.otp); // Log the OTP field specifically
        // console.log(user.map(e => e)); // Log the OTP field specifically
        
        if (!user.otp) {
            return res.status(400).json({
                error: 'No OTP found for this user'
            });
        }

        // Check if OTP has expired
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                error: 'OTP has expired'
            });
        }

        // Compare the provided OTP with the stored hashed OTP
        const isMatch = bcryptjs.compareSync(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({
                error: 'Invalid OTP'
            });
        }

        // Clear OTP fields and mark user as verified
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;

        await user.save();

        res.status(200).json({
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: `Error: ${error.message}`
        });
    }
};

const resendOTP = async (req, res) => {
    try {
        console.log(req.body); // Debugging line
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a new OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Set OTP expiration time (e.g., 10 minutes from now)
        const otpExpires = Date.now() + 10 * 60 * 1000;

        // Hash the OTP before saving it
        const salt = bcryptjs.genSaltSync(10);
        const hashedOTP = bcryptjs.hashSync(otp, salt);

        // Update the user's OTP and expiration time
        user.otp = hashedOTP;
        user.otpExpires = otpExpires;
        await user.save();

        // Prepare email options
        const mailOptions = {
            email: user.email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
        };

        // Send the OTP via email
        const emailResponse = await sendEmail(mailOptions);

        if (emailResponse.success) {
            res.status(200).json({ 
                message: 'OTP resent successfully',
                otp
            });
        } else {
            res.status(500).json({ 
                error: emailResponse.message
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};




const logIn = async(req, res)=>{
    try {
        //get data from the request body
        const {email, password}= req.body
        //chech if user email is already exist
        const user = await userModel.findOne({email: email.toLowerCase()})
        if (!user) {
            return res.status(404).json({
                error: "This email does not exist"
            })
        }
        //check for user password
        const checkPassword = bcryptjs.compareSync(password, user.password)
        if (!checkPassword) {
            return res.status(404).json({
                error: "Password incorrect"
            })
        } 
        
        //generate token 
        const token = jwt.sign({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }, process.env.JWT_SECRET, {expiresIn: "2d"}) 
        //Throw success message
        res.status(200).json({
            message: "Login Successful",
            data: user,
            token
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

const getOneUser = async(req, res)=>{
    try {
        const {userId} = req.user
        console.log(userId)
        const getOne = await userModel.findById(userId)
        if (!getOne) {
            return res.status(404).json({
                error: "Unable to find user"
            })
        }
        res.status(200).json({
            message: `User found ${getOne.firstName}`,
            data: getOne
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


const signOut = async (req, res) => {
    try {
      const userId = req.params.userId;
      const newUser = await userModel.findById(userId);
      if (!newUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      newUser.token = null;
      await newUser.save();
      return res.status(201).json({
        message: `user has been signed out successfully`,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error: " + error.message,
      });
    }
  };


const forgotPassword = async (req, res) => {
    const resetFunc = require("../helpers/forgotUserpass")
    try {
        const myUser = await userModel.findOne({email: req.body.email})
        if (!myUser) {
            return res.status(404).json({
                message: "This Email does not exist"
            })
        }
        else {
            const name = myUser.firstName + ' ' + myUser.lastName
            const subject = 'Kindly reset your password'
            const link = `https://furniro-iota-eight.vercel.app/#/forget-password{myUser.id}`
            const html = resetFunc(name, link)
            sendEmail({
                email: myUser.email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Check your email to reset your password",
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        // Get user ID from params and token from query
        const id = req.params.id;
        const token = req.query.token;
        const password = req.body.password;

        // Check if password exists
        if (!password) {
            return res.status(400).json({
                message: "Password cannot be left empty"
            });
        }

        // Find the user by ID
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify token (assuming you store the reset token in the user document)
        if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        // Hash the new password
        const saltPass = bcryptjs.genSaltSync(12);
        const hashPass = bcryptjs.hashSync(password, saltPass);

        // Update user's password and clear the reset token
        user.password = hashPass;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Success
        return res.status(200).json({
            message: "Password successfully reset",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};




//   // Set up Twitter strategy

// passport.use(new TwitterStrategy({
//   consumerKey: process.env.TWITTER_CONSUMER_KEY,
//   consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//   callbackURL: process.env.TWITTER_CALLBACK_URL,
//   includeEmail: true,
// },
//   async (token, tokenSecret, profile, done) => {
//     try {
//       console.log("Profile: " + profile);
//       // Twitter does not always provide an email, so handle this case
//       const email = profile.emails[0].value;

//       let user = await userModel.findOne({ email });

//       if (!user) {
//         user = await userModel.create({
//           firstName: profile.displayName.split(' ')[0] || '',
//           lastName: profile.displayName.split(' ')[1] || '',
//           email: email || '',
//           profilePicture: {
//             url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
//             public_id: Date.now().toString() // Ensure public_id is a string
//           },
//           isVerified: true // Assume email is verified if using Twitter
//         });
//       }

//       return done(null, user);
//     } catch (error) {
//       return done(error, false);
//     }
//   }));

module.exports = {signUp, logIn, passport, getOneUser,forgotPassword, resetPassword, verifyOTP, resendOTP, signOut}