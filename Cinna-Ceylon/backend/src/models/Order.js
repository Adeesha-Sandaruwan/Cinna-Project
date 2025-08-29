import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const orderItemSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new Schema({
  user: { type: Types.ObjectId, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','shipped','completed','cancelled'], default: 'pending' }
}, { timestamps: true });

export default model('Order', orderSchema);
