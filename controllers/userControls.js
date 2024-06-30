const userModel = require('../models/userModel')
require("dotenv").config()
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
        const salt = bcrypt.genSaltSync(12)
        const hash = bcrypt.hashSync(password, salt)
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