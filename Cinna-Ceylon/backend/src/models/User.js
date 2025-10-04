import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'supplier', 'driver'], required: true },
  role: { type: String, enum: ['delivery manager', 'product manager', 'finance manager', 'user manager'] },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  profile: {
    name: String,
    address: String,
    phone: String
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
