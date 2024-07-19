const express = require("express")
const cartRouter=express.Router()

const {addToCart, removeFromCart, viewCart, deleteCart} = require("../controllers/cartController")
const {authenticate} = require("../middleWares/authentication")

cartRouter.post('/add-to-cart/:userId/:productId',  authenticate, addToCart);
cartRouter.delete('/remove-from-cart/:userId/:productId', authenticate, removeFromCart);
cartRouter.get('/view-cart/:cartId', authenticate, viewCart);
cartRouter.delete('/delete-cart/:userId', authenticate, deleteCart);

module.exports = cartRouter