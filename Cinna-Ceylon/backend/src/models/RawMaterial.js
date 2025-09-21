import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  materialPhoto: { type: String, required: true }, // Image filename
  quantity: { type: Number, required: true, min: 0.1 },
  quality: { 
    type: String, 
    required: true,
    enum: ['ALBA', 'C5', 'C4', 'H1', 'H2', 'H3', 'H4', 'M5', 'M4']
  },
  description: { type: String, trim: true },
  pricePerKg: { type: Number, required: true, min: 0 },
  harvestDate: { type: Date },
  location: { type: String, trim: true },
  moistureContent: { type: Number, min: 0, max: 100 }, // Percentage
  processingMethod: { 
    type: String, 
    enum: ['Traditional', 'Mechanical', 'Mixed'] 
  },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'], 
    default: 'available' 
  },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  addedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for better query performance
rawMaterialSchema.index({ supplier: 1, status: 1 });
rawMaterialSchema.index({ quality: 1, status: 1 });

export default mongoose.model("RawMaterial", rawMaterialSchema);