import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const cartItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
  priceAtAdd: { type: Number, required: true }
}, { _id: false });

const cartSchema = new Schema({
  user: { type: String, required: true, index: true },
  status: { type: String, enum: ['active','abandoned','checked_out'], default: 'active' },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default model('Cart', cartSchema);
