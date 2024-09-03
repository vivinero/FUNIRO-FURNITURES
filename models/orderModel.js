
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
  orderId: {
    type: Number,
    unique: true
  },

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
  email: {type:String},
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

  //trackingId :{ type:String, unique: true},
  returns: [returnSchema],


});

// Apply auto-increment plugin to the orderId field
orderSchema.plugin(AutoIncrement, { inc_field: 'orderId' });

const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;
