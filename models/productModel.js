const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    itemName : {
      type : String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
      required: true,
    },
    colors: {
      type: [String], // Array of colors
      required: true,
    },
    sizes: [sizeSchema], // Array of sizes with prices
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
