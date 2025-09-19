import mongoose from "mongoose";

const supplyRecordSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  rawMaterial: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterial", required: true },
  buyer: { type: String, required: true }, // Buyer name/email
  quantitySold: { type: Number, required: true, min: 0.1 },
  pricePerKg: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  deliveryStatus: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  notes: { type: String, trim: true }
}, { timestamps: true });

// Calculate total amount before saving
supplyRecordSchema.pre('save', function(next) {
  this.totalAmount = this.quantitySold * this.pricePerKg;
  next();
});

export default mongoose.model("SupplyRecord", supplyRecordSchema);