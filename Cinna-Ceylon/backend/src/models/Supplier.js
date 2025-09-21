import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  profileImage: { type: String }, // Store image filename
  whatsappNumber: { type: String }, // For direct WhatsApp contact
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);