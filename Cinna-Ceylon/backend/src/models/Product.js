import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  type: String,
  grade: String,
  expiryDate: Date,
  visibility: { type: String, enum: ["public","private"], default: "public" }
}, { timestamps: true });

export default model('Product', productSchema);
