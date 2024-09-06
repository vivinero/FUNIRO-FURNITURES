// purchaseHistory.js (model)

const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId,
     ref: 'user' },
  productId: { type: mongoose.Schema.Types.ObjectId,
     ref: 'Product' },
  quantity: { type: Number,
     required: true },
  purchaseDate: { type: Date,
     default: Date.now }
});

const PurchaseHistory = mongoose.model('PurchaseHistory', purchaseHistorySchema);

module.exports = PurchaseHistory;