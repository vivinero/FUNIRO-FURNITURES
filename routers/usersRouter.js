const router = require("express").Router()
// const passport = require("passport")
// const jwt = require("jsonwebtoken")
// const jwtSecret = process.env.JWT_SECRET

const { signUp, logIn, verifyOTP, getOneUser, signOut, forgotPassword, resetPassword } = require("../controllers/userControls")

router.post("/signup", signUp)
router.post("/log-in", logIn)
// router.post("/verify-otp", verifyOTP)
// router.get("/get-one", getOneUser)
// router.post("/sign-out", signOut)
// router.post("/forgot", forgotPassword)
// router.post("/reset", resetPassword)


module.exports = router