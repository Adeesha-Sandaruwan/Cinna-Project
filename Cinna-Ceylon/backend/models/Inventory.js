const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  inventory_id: { type: String, required: true, unique: true, index: true },
  Status: { type: String },
  Total_qty: { type: Number },
  Type: { type: String },
  order_reference: { type: String },
  Product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  Order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;




