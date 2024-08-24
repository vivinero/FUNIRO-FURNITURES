const userRouter = require("express").Router()
const passport = require('passport');
const jwt = require('jsonwebtoken');
// const {userValidation} = require('../middleWares/userValidation')
const {authenticate}= require("../middleWares/authentication")
const  { logIn, signUp, getOneUser, signOut, verifyOTP, forgotPassword, resetPassword, resendOTP}  = require("../controllers/userControls")
const jwtSecret = process.env.JWT_SECRET;

// Google Authentication Routes
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRouter.post('/sign-up', signUp)
userRouter.post('/login', logIn)
userRouter.post('/sign-out/:userId', authenticate, signOut)
userRouter.post('/verify-otp/:id', verifyOTP);
userRouter.post("/forgot", forgotPassword)
userRouter.post("/reset/:id", resetPassword)
userRouter.post("/resend-otp", resendOTP)
userRouter.get("/get-one/:id", getOneUser)
userRouter.post("/sign-out/:id", signOut)


userRouter.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: false // No session persistence
}), (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, jwtSecret, { expiresIn: '1h' }); // Use only the ID for the token
    res.redirect(`https://spiraltech.onrender.com/#/auth-success?token=${token}`);
});

// Google Failure Route
userRouter.get('/auth/google/failure', (req, res) => {
    res.send("Failed to authenticate using Google. Please try again.");
});


module.exports = userRouter

