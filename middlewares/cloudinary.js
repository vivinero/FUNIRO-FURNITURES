const cloudinary = require("cloudinary").v2

require("dotenv").config()

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.cloudKey,
    api_secret: process.env.cloudSecret
});

module.exports = cloudinary;