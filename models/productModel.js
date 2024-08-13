const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
    price: { 
      type: Number,
      required: true,
    },
    discountedGeneralPrice: { 
      type: Number,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    discountedPrices: [
      {
        size: String,
        price: Number,
      }
    ],
    discountPercentage: {
      type: Number,
      default: 0, // Default to 0% discount
    },
    sizes: [sizeSchema], 
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Category",
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: {
          type: Number,
          min: [1, 'Rating cannot be less than 1'],
          max: [5, 'Rating cannot be more than 5'],
        },
        
      },
    ],
    averageRating: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
