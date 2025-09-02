import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const orderSchema = new Schema({
  user: { type: String, required: true },
  items: [{
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  paymentMethod: String,
  status: { type: String, default: 'pending' }
}, { 
  timestamps: true,
  autoIndex: false // Disable automatic indexing
});

export default model('Order', orderSchema);
