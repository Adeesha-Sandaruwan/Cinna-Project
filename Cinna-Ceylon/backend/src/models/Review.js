import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

export default model('Review', reviewSchema);
