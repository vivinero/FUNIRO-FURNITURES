const express = require("express")
const cartRouter=express.Router()

const {addToCart,
    updateCart,
     removeFromCart,
      viewCart,
       deleteCart,
       checkout,
       getOrderDetails,
       getAllOrders,
       getOrderProducts,
       returnProduct,
       processReturnRequest,
       trackOrder,
       updateOrderMovement} = require("../controllers/cartController")
const {authenticate} = require("../middleWares/authentication")

cartRouter.post('/add-to-cart/:userId/:productId',  authenticate, addToCart);
cartRouter.delete('/remove-from-cart/:userId/:productId', authenticate, removeFromCart);
cartRouter.get('/view-cart/:userId', authenticate, viewCart);
cartRouter.put('/update-quantity/:userId/:productId', authenticate, updateCart);
cartRouter.delete('/delete-cart/:userId', authenticate, deleteCart);
 cartRouter.post('/checkout/:userId', checkout);
 cartRouter.get("/order-details/:orderId", getOrderDetails)
 cartRouter.get('/orders', getAllOrders);
 cartRouter.get("/ordered-products", getOrderProducts)
 cartRouter.post('/return-product', returnProduct);
 cartRouter.post('/process-return-request/:orderId/:returnId', processReturnRequest);
 cartRouter.get('/track-order', trackOrder);
 cartRouter.post('/update-movement/:trackingId', updateOrderMovement);


module.exports = cartRouter