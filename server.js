const express = require("express");
require('./config/config');
const cors = require('cors');

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

// CORS configuration
const corsOptions = { 
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};

// Create express instance
const app = express();

// Middleware for CORS and JSON parsing
app.use(cors(corsOptions));
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
app.use(subConfirmationRouter);

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
