import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// Sub-schema for individual cart items
const cartItemSchema = new Schema({
  // Reference to the Product document
  product: { type: Types.ObjectId, ref: 'Product', required: true },

  // Quantity of this product in the cart (must be >= 1)
  qty: { type: Number, required: true, min: 1 },

  // Price of product at the time it was added (so changes in Product.price won’t affect the cart)
  priceAtAdd: { type: Number, required: true }
}, { 
  // Do not create separate _id for each cart item
  _id: false 
});

// Main Cart schema
const cartSchema = new Schema({
  user: { type: String, required: true, index: true },
  status: { type: String, enum: ['active','abandoned','checked_out'], default: 'active' },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default model('Cart', cartSchema);
