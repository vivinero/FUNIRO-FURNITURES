const express = require("express")
require('./config/config')
const userRouter = require("./routers/userRouter")
const categoryRouter = require("./routers/categoryRouter")
const productRouter = require("./routers/productRouter")


//create express instance
const app = express()
app.use(express.json())
app.use(userRouter)
app.use(categoryRouter)
app.use(productRouter)

app.listen(process.env.port,()=>{
    console.log(`Server is Listening on port: ${process.env.port}`);
})