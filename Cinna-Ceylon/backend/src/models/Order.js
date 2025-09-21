import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const orderSchema = new Schema({
  user: { type: String, required: true },

  // Items can be either a product or an offer/bundle
  items: [
    {
      product: { type: Types.ObjectId, ref: 'Product' }, // optional for offers
      offer: { type: Types.ObjectId, ref: 'Offer' }, // optional for regular products
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      itemType: { type: String, enum: ['product', 'offer'], required: true }, // indicates type
      originalPrice: Number, // optional, for offers to show discount
    }
  ],

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

  paymentMethod: { type: String, enum: ['Credit Card', 'Pay at Delivery'], default: 'Pay at Delivery' },
  status: { type: String, default: 'pending' } // pending, paid, shipped, delivered, etc.

}, { 
  timestamps: true,
  autoIndex: false // Disable automatic indexing
});

// Export Order model
export default model('Order', orderSchema);
