const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
    },
    otpExpires:{
        type: Date,
    }
    
}, {timestamps: true});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
