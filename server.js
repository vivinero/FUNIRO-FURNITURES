const express = require("express")
require('./config/config')
const userRouter = require("./routers/userRouter")
const categoryRouter = require("./routers/categoryRouter")
const productRouter = require("./routers/productRouter")
const cors = require('cors');


//create express instance
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(categoryRouter)
app.use(productRouter)

// Middleware for CORS
app.use(cors("*"))

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    return res.send("Welcome to Funiro Furnitures");
})

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