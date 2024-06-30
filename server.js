const express = require("express")
require('./config/config')
const userRouter = require("./routers/userRouter")

const app = express()
app.use(express.json())
app.use(userRouter)

app.listen(process.env.port,()=>{
    console.log(`Server is Listening on port: ${process.env.port}`);
})