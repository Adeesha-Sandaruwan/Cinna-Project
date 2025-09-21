import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// Sub-schema for individual cart items (products)
const cartItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
  priceAtAdd: { type: Number, required: true }
}, { 
  _id: false 
});

// Sub-schema for offer items in cart
const offerItemSchema = new Schema({
  offer: { type: Types.ObjectId, ref: 'Offer', required: true },
  qty: { type: Number, required: true, min: 1 },
  discountedPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true }
}, {
  _id: false
});

// Main Cart schema
const cartSchema = new Schema({
  user: { type: String, required: true, index: true },
  status: { type: String, enum: ['active','abandoned','checked_out'], default: 'active' },
  items: [cartItemSchema], // Regular products
  offerItems: [offerItemSchema], // Offer bundles
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default model('Cart', cartSchema);