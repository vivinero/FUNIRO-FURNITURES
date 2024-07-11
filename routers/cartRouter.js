const express = require("express")
const cartRouter=express.Router()

const {addToCart, removeFromCart, deleteCart} = require("../controllers/cartController")

cartRouter.post('/add-to-cart/:userId/:productId', addToCart);
cartRouter.delete('/remove-from-cart/:userId/:productId', removeFromCart);
cartRouter.delete('/delete-cart/:userId', deleteCart);

module.exports = cartRouter