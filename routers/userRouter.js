const userRouter = require("express").Router()
const {authenticate} = require("../middleWares/authentication")
const {signUp, logIn, signOut, getOneUser, sendOTP, verifyOTP} = require("../controllers/userControls")

userRouter.post('/sign-up', signUp)
userRouter.post('/log-in', logIn)
userRouter.get('/get-one', authenticate, getOneUser)
userRouter.post('/sign-out', signOut)
userRouter.post('/send-otp', sendOTP);
userRouter.post('/verify-otp', verifyOTP);


module.exports = userRouter

