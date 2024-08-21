const express = require("express")
require('./config/config')
const userRouter = require("./routers/userRouter")
const categoryRouter = require("./routers/categoryRouter")
const productRouter = require("./routers/productRouter")
const cartRouter = require("./routers/cartRouter")
const filterRouter = require('./routers/filterRouter.js')
const contactUsRouter = require('./routers/contactUsRouter.js')
const subRouter = require('./routers/subscriptionRouter.js')
const subConfirmationRouter = require('./routers/subConfirmationRouter')
const blog = require("./routers/blogRouter.js")
const cors = require('cors');

const corsOptions = { 
    origin: process.env.CORS_ORIGIN || '*' ,
    optionSuccessStatus:200
}


//create express instance
const app = express()


// Middleware for CORS
// app.use(cors("*"))
// app.use(cors(corsOptions))

app.options('*', cors(corsOptions)); // Allow preflight requests for all routes


app.use(express.json())


// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    return res.send("Welcome to Funiro Furnitures");
})



app.use(userRouter)
app.use(categoryRouter)
app.use(productRouter)
app.use(blog)
app.use(cartRouter)
app.use(filterRouter)
app.use(contactUsRouter)
app.use(subRouter)
app.use(subConfirmationRouter)

app.use('/upload', express.static('uploads'))


// Add error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    res.status(500).json({ message: 'Internal Server Error: ' + err });
    next();
});


app.listen(process.env.port,()=>{
    console.log(`Server is Listening on port: ${process.env.port}`);
})