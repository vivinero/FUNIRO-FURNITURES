const userRouter = require("express").Router()

const {signUp} = require("../controllers/userControls")

userRouter.post('sign-up', signUp)


module.exports = userRouter