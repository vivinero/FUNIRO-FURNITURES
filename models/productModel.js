// const mongoose = require("mongoose");

// const commentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   comment: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const sizeSchema = new mongoose.Schema({
//   size: {
//     type: String,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   images: [
//     {
//       public_id: String,
//       url: String,
//     },
//   ],
// });

// const productSchema = new mongoose.Schema(
//   {
//     itemName : {
//       type : String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     price: { 
//       type: Number,
//       required: true,
//     },
//     discountedGeneralPrice: { 
//       type: Number,
//     },
//     images: {
//       type: Array,
//       default: [],
//       required: true,
//     },
//     colors: {
//       type: [String], // Array of colors
//       required: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     discountedPrices: [
//       {
//         size: String,
//         price: Number,
//       }
//     ],
//     discountPercentage: {
//       type: Number,
//       default: 0, // Default to 0% discount
//     },
//     sizes: [sizeSchema], 
//     category: {
//       type: mongoose.SchemaTypes.ObjectId,
//       ref: "Category",
//     },
//     likes: {
//       type: Number,
//       default: 0,
//     },
//     likedBy: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     ratings: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         rating: {
//           type: Number,
//           min: [1, 'Rating cannot be less than 1'],
//           max: [5, 'Rating cannot be more than 5'],
//         },
        
//       },
//     ],
//     averageRating: { type: Number, default: 0 },
//     comments: [commentSchema],
//   },
//   { timestamps: true }
// );

// const productModel = mongoose.model("Product", productSchema);
// module.exports = productModel;




const mongoose = require("mongoose");

// Schema for comments
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

// Schema for sizes, including price and images specific to that size
const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true, 
  },
  images: 
    {
      type:Array
    },
  
});

// Main Product schema
const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
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
    images:{
      type: Array
    },
    colors: {
      type: Array, 
      required: true,
    },
    stock: {
      type: Number,
      //required: true
      required: function () {
        // Stock is only required when there are no sizes defined
        return this.sizes.length === 0;
      },
    },
  
    createdAt: {
      type: Date,
      default: Date.now,
    },
    discountedPrices: [
      {
        size: String,
        price: Number,
      },
    ],
    discountPercentage: {
      type: Number,
      default: 0, // Default to 0% discount
    },
    sizes: [sizeSchema], // Schema for different sizes
    
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
    comments: [commentSchema], // Schema for product comments
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
