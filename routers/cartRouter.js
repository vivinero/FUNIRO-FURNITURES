const express = require("express")
const cartRouter=express.Router()

const {addToCart,
    updateCart,
     removeFromCart,
      viewCart,
       deleteCart,
       checkout,
       getOrderDetails,
       getAllOrders} = require("../controllers/cartController")
const {authenticate} = require("../middleWares/authentication")

cartRouter.post('/add-to-cart/:userId/:productId',  authenticate, addToCart);
cartRouter.delete('/remove-from-cart/:userId/:productId', authenticate, removeFromCart);
cartRouter.get('/view-cart/:userId', authenticate, viewCart);
cartRouter.put('/update-quantity/:userId/:productId', authenticate, updateCart);
cartRouter.delete('/delete-cart/:userId', authenticate, deleteCart);
 cartRouter.post('/checkout/:userId', checkout);
 cartRouter.get("/order-details/:orderId", getOrderDetails)
 cartRouter.get('/orders', getAllOrders)

module.exports = cartRouter