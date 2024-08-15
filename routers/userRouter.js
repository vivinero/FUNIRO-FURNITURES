const userRouter = require("express").Router()
const {authenticate} = require("../middleWares/authentication")
const {userValidation} = require('../middleWares/userValidation')
const {signUp, logIn, signOut, getOneUser, sendOTP, verifyOTP} = require("../controllers/userControls")

userRouter.post('/sign-up', userValidation,signUp)
userRouter.post('/log-in', logIn)
userRouter.get('/get-one', authenticate, getOneUser)
userRouter.post('/sign-out/:userId', authenticate, signOut)
userRouter.post('/verify-otp', verifyOTP);


module.exports = userRouter

