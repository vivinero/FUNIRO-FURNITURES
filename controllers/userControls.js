const userModel = require('../models/userModel')
require("dotenv").config()
const otpGenerator = require('otp-generator')
const transporter = require('../config/nodeMailer')
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.signUp = async (req, res)=>{
    try {
        const {firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body
        const emailExist = await userModel.findOne({email})
        if (emailExist) {
            return res.status(404).json({
                error: "User already exist"
            })
        }

        if (confirmPassword != password) {
            return res.status(400).json({
                error: "Password mismatch"
            })
        }
        const salt = bcryptjs.genSaltSync(12)
        const hash = bcryptjs.hashSync(password, salt)
        //register the user
        const newUser = await userModel.create({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            email: email.toLowerCase(),
            password: hash,
            phoneNumber,
            confirmPassword: hash
        })

        const token = jwt.sign({
            userId: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        },process.env.jwtSecret,{expiresIn:"6000s"})

        res.status(200).json({
            message: `Hello, ${newUser.firstName} Your Account Has Been Successfully Created`,
            data: newUser
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

// Set OTP to expire in 5 minutes
const OTP_EXPIRATION_TIME = 300000; 

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

        // Hash OTP
        const salt = bcryptjs.genSaltSync(12);
        const hashOTP = bcryptjs.hashSync(otp, salt);

        // Here we store hashed OTP and expiration in the DB
        await userModel.findOneAndUpdate(
            { email },
            { otp: hashOTP, otpExpires: Date.now() + OTP_EXPIRATION_TIME },
            { new: true, upsert: true }
        );

        // Send OTP to the user's email addresss
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP code",
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "OTP has been sent to your mail"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                 error: 'User not found' 
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                 error: 'OTP has expired' 
            });
        }

        const isMatch = bcryptjs.compareSync(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({
                error: 'This OTP Invalid '
            });
        }

        // This is to clear OTP and OTP expiration tim
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ 
            message: 'OTP verified successfully' 
        });
    } catch (error) {
        res.status(500).json({
             error: error.message 
        });
    }
};



exports.logIn = async(req, res)=>{
    try {
        //get data from the request body
        const {email, password}= req.body
        //chech if user email already exist
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
            data: token
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

exports.getOneUser = async(req, res)=>{
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


exports.signOut = async (req, res) => {
    try {
        const token = req.headers.authorization.spilt(' ')[1]
        if (!token) {
            return res.status(404).json({
                message: "Authorization failed unable to find token"
            })
        } 
        //get user id
        const userId = req.user.userId

        //find user
        const user = await userModel.findById(userId)

        //push the user to blacklist and save
        user.blackList.push(token)

        //save user
        await user.save()

        //show success
        res.status(200).json({
            message: "You have successfully logged out "
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
exports.forgotPassword = async (req, res) => {
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
            const link = `http://localhost:${port}/user-reset/${myUser.id}`
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

exports.resetPassword = async (req, res) => {
    try {
        //get id from params
        const id = req.params.id;
        //get data from body
        const password = req.body.password;
        //check if password exist
        if (!password) {
            return res.status(404).json({
                message: "Password cannot be left empty"
            })
        }

        const saltPass = bcryptjs.genSaltSync(12);
        const hashPass = bcryptjs.hashSync(password, saltPass);

        const resetPassword = await userModel.findByIdAndUpdate(id, { password: hashPass }, { new: true });
        
        //success
        return res.status(200).json({
            message: "Successfully reset Password",
            resetPassword
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}