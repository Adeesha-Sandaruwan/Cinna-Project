import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    enum: [
      'admin',
      'manager',
      'buyer',
      'supplier',
      'driver'
    ], 
    required: true 
  },
  role: { 
    type: String,
    // Removed explicit null from enum; absence of role is "undefined" which is allowed.
    enum: [
      'admin',
      'delivery_manager',
      'product_manager',
      'finance_manager',
      'user_manager',
      'vehicle_manager',
      'supplier_manager',
      'hr_manager'
    ]
  },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  profile: {
    name: String,
    address: String,
    phone: String
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
