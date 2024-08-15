const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        require: true
    },
    categoryInfo:{
        type: String,
    },
    admin:{
        type: String,
    },
    images:{type:Array}, 
    products: [{
        type: mongoose.SchemaTypes.ObjectId,
            ref: "Product"
    }]
}, {timestamps: true})

const categoryModel = mongoose.model("Category", categorySchema)
module.exports = categoryModel