const express = require("express")
require('./config/config')
const userRouter = require("./routers/userRouter")
const categoryRouter = require("./routers/categoryRouter")
const productRouter = require("./routers/productRouter")
const cartRouter = require("./routers/cartRouter")
const filterRouter = require('./routers/filterRouter.js')
const contactUsRouter = require('./routers/contactUsRouter.js')


//create express instance
const app = express()
app.use(express.json())
app.use(userRouter)
app.use(categoryRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(filterRouter)
app.use(contactUsRouter)

app.use('/upload', express.static('uploads'))


app.listen(process.env.port,()=>{
    console.log(`Server is Listening on port: ${process.env.port}`);
})