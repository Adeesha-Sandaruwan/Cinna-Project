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
  // User ID (or username/email). Indexed for faster queries.
  user: { type: String, required: true, index: true },

  // Cart status
  // - active: ongoing cart
  // - abandoned: user left cart without checkout
  // - checked_out: cart completed and converted into an order
  status: { type: String, enum: ['active','abandoned','checked_out'], default: 'active' },

  // Array of items in the cart
  items: [cartItemSchema],

  // Subtotal (before taxes/discounts/shipping)
  subtotal: { type: Number, default: 0 },

  // Total (final price after all adjustments)
  total: { type: Number, default: 0 }
}, { 
  // Adds createdAt and updatedAt timestamps
  timestamps: true 
});

// Export Cart model
export default model('Cart', cartSchema);
