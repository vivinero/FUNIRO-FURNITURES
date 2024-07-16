const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user"

    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"

        },
         quantity: { type: Number },
         price:{ type: Number},
         sub_total:{ type: Number},
         productName:{ type:String},
         productImage:{ type:String}
    }],
    total:{
        type:Number
    }

},{timestamp: true})

const cartModel = mongoose.model("Cart", CartSchema)
module.exports = cartModel