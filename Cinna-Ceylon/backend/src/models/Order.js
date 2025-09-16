import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// Order schema definition
const orderSchema = new Schema({
  // User ID or identifier of the buyer
  user: { type: String, required: true },

  // List of ordered items
  items: [{
    // Reference to Product document
    product: { type: Types.ObjectId, ref: 'Product', required: true },

    // Quantity ordered
    qty: { type: Number, required: true },

    // Price per item at the time of order (to preserve history)
    price: { type: Number, required: true }
  }],

  // Total amount charged for the order (all items combined)
  total: { type: Number, required: true },

  // Shipping address details (embedded object)
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },

  // Payment method (e.g., "Credit Card", "PayPal", "Cash on Delivery")
  paymentMethod: String,

  // Order status (default = pending)
  // Can later be updated to: shipped, delivered, cancelled, etc.
  status: { type: String, default: 'pending' }
}, { 
  // Automatically add createdAt & updatedAt
  timestamps: true,

  // Prevents mongoose from auto-creating indexes (better for production control)
  autoIndex: false 
});

// Export Order model
export default model('Order', orderSchema);
