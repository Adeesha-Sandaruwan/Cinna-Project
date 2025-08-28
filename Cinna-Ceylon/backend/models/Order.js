const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  Order_id: { type: String, required: true, unique: true, index: true },
  Order_date: { type: Date },
  Status: { type: String },
  Total_amount: { type: Number },
  qty: { type: Number },
  Buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  Inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;



