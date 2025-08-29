import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const inventorySchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 0 },
  location: String
}, { timestamps: true });

export default model('Inventory', inventorySchema);
