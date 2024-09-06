const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const hasAuthorization = req.headers.authorization;
        if (!hasAuthorization) {
            return res.status(400).json({
                message: 'Invalid authorization',
            })
        }
        const token = hasAuthorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                message: "Token not found",
            });
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decodeToken.userId);
        if (!user) {
            return res.status(404).json({
                message: "Not authorized: User not found",
            });
        }

        req.user = {
            userId: user._id,
            decodeToken
        }

        next();
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError){
            return res.status(401).json({
                message: 'Invalid or expired token, please login to continue',
            })
        }
        return res.status(500).json({
            Error: "Authentication error:  " + error.message,
        })        
    }
};





// Authorized users to getAll
const Admin = (req, res, next) => {
    authenticate(req, res, async () => {
        if (req.user.isAdmin) {
            next()
        } else {
            return res.status(400).json({
                message: "Not an Admin! User not authorized"
            })
        }
    })
}


module.exports = {
    authenticate,
    Admin,

}