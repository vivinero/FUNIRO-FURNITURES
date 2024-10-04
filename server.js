const express = require("express");
require('./config/config');
const cors = require('cors');
const cron = require('node-cron');
const orderModel = require('./models/orderModel'); 

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
const purchaseHistoryRouter = require("./routers/purchaseHistoryRouter.js")

const passport = require("passport");
const session = require("express-session");




// Create express instance
const app = express();

// app.use(cors("*"))
 app.use(cors(corsOptions))

 // Allow preflight requests for all routes
app.options('*', cors(corsOptions)); 


app.use(express.json())


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport and manage sessions
app.use(passport.initialize());
app.use(passport.session());

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
app.use (purchaseHistoryRouter)


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




// Example: Automate order movement every 5 minutes
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, 
  },
});

// cron.schedule('*/1 * * * *', async () => {
//   try {
//     const orders = await orderModel.find({
//       status: { $in: ['Pending', 'Processing', 'Shipped', 'Out for Delivery'] },
//     });

//     orders.forEach(async (order) => {
//       let nextStatus;
//       let location;
//       let emailSubject;
//       let emailMessage;

//       // Determine the next status and email content based on the current status
//       switch (order.status) {
//         case 'Pending':
//           nextStatus = 'Processing';
//           location = 'Warehouse';
//           emailSubject = 'Your order is now being processed!';
//           emailMessage = 'Your order has moved from Pending to Processing.';
//           break;
//         case 'Processing':
//           nextStatus = 'Shipped';
//           location = 'On the way to the sorting center';
//           emailSubject = 'Your order has been shipped!';
//           emailMessage = 'Your order has moved from Processing to Shipped.';
//           break;
//         case 'Shipped':
//           nextStatus = 'Out for Delivery';
//           location = 'In transit to delivery address';
//           emailSubject = 'Your order is out for delivery!';
//           emailMessage = 'Your order has moved from Shipped to Out for Delivery.';
//           break;
//         case 'Out for Delivery':
//           nextStatus = 'Delivered';
//           location = 'At delivery address';
//           emailSubject = 'Your order has been delivered!';
//           emailMessage = 'Your order has moved from Out for Delivery to Delivered.';
//           break;
//         default:
//           return;
//       }

//       // Update the order's status and movement logs
//       order.status = nextStatus;
//       order.movementLogs.push({
//         status: nextStatus,
//         location: location,
//         details: `Order status updated to ${nextStatus}.`,
//       });

//       await order.save();

//       // Send the notification email
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: order.email, 
//         subject: emailSubject,
//         html: `<p>Dear ${order.userName},</p>
//                <p>${emailMessage}</p>
//                <p>Location: ${location}</p>
//                <p>Thank you for shopping with us!</p>`,
//       };

//       await transporter.sendMail(mailOptions);
//     });
//   } catch (err) {
//     console.error(`Error automating order movement: ${err.message}`);
//   }
// });




// cron.schedule('*/5 * * * *', async () => {
//   try {
//     const orders = await orderModel.find({ status: { $in: ['Pending', 'Processing', 'Shipped'] } });

//     orders.forEach(async (order) => {
//       let nextStatus;
//       let location;

//       // Determine the next status based on current status
//       switch (order.status) {
//         case 'Pending':
//           nextStatus = 'Processing';
//           location = 'Warehouse';
//           break;
//         case 'Processing':
//           nextStatus = 'Shipped';
//           location = 'On the way to the sorting center';
//           break;
//         case 'Shipped':
//           nextStatus = 'Out for Delivery';
//           location = 'In transit to delivery address';
//           break;
//         case 'Out for Delivery':
//           nextStatus = 'Delivered';
//           location = 'At delivery address';
//           break;
//         default:
//           return;
//       }

//       // Update the order's status and movement logs
//       order.status = nextStatus;
//       order.movementLogs.push({
//         status: nextStatus,
//         location: location,
//         details: `Order status updated to ${nextStatus}.`,
//       });

//       await order.save();
//     });
//   } catch (err) {
//     console.error(`Error automating order movement: ${err.message}`);
//   }
// });


// Start the server


const PORT = process.env.PORT || 3000;
const server =app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});


server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
});
