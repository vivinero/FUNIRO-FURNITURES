const mongoose = require("mongoose")
const { type } = require("os")
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
}, {timestamps: true})

const userModel = mongoose.model("user", userSchema)
module.exports = userModel