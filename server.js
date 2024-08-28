const express = require("express");
require('./config/config');
const cors = require('cors');


// const corsOptions = { 
//     origin: process.env.CORS_ORIGIN || '*' ,
//     optionSuccessStatus:200
// }
const allowedOrigins = [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_PRODUCTION];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
};


// Routers
const userRouter = require("./routers/userRouter");
const categoryRouter = require("./routers/categoryRouter");
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const filterRouter = require('./routers/filterRouter.js');
const contactUsRouter = require('./routers/contactUsRouter.js');
const subRouter = require('./routers/subscriptionRouter.js');
const subConfirmationRouter = require('./routers/subConfirmationRouter');
const blogRouter = require("./routers/blogRouter.js");
const locationRoutes = require('./routers/locationRouter');
const formRouter = require('./routers/formRouter')



// Create express instance
const app = express();


// Middleware for CORS
// app.use(cors("*"))
 app.use(cors(corsOptions))

 // Allow preflight requests for all routes
app.options('*', cors(corsOptions)); 


app.use(express.json())


// app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(blogRouter);
app.use(cartRouter);
app.use(filterRouter);
app.use(contactUsRouter);
app.use(subRouter);
app.use('/',subConfirmationRouter);
app.use(locationRoutes);
app.use(formRouter)


// Static file serving
app.use('/upload', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
    return res.send("Welcome to Funiro Furnitures");
});

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    res.status(500).json({ message: 'Internal Server Error: ' + err });
    next();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
