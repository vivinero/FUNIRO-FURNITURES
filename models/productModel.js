const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
    itemName:{
        type: String,
        require: true
    },
    detail:{
        type: String,
        require: true
    },
    price:{
        type: Number,
        require: true
    },
    image:{
        type: Array,
        default: [],
        required: true
    },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
            ref: "Category"
    }
}, {timestamps: true})

const productModel = mongoose.model("Product", productSchema)
module.exports = productModel