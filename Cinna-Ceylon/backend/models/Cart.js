const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cart_id: { type: String, required: true, unique: true, index: true },
  created_at: { type: Date, default: Date.now },
  Active: { type: Boolean },
  Abandoned: { type: Boolean },
  Checked_out: { type: Boolean },
  Product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  Buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;


