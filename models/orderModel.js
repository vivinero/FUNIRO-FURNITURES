
const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  quantity: Number,
  reasonForReturn: String,
  productCondition:{
    type:String,
    enum:["New", "Damaged", "Defective"]
  },
  additionalComments: String,
  status: { type: String, default: "Pending", },
  returnDate: { type: Date, default: Date.now }
});


const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true }
  }],
  total: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  userName: {type:String},
  status: {
    type: String,
    default: "Pending", 
    enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
  },
  statusUpdates: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  movementLogs: [
    {
      location: String, 
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: String, 
    },
  ],

  trackingId :{ type:String, unique: true},
  returns: [returnSchema],


});


const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;
