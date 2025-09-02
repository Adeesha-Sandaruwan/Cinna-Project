import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, sparse: true },
    type: { type: String, required: true }, 
    grade: { type: String, enum: ["A", "B", "C"], default: "A" },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    safetyStock: { type: Number, default: 5, min: 0 },
    reorderLevel: { type: Number, default: 10, min: 0 },
    expiryDate: { type: Date, required: true },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    image: { type: String },
  },
  { timestamps: true }
);

// Virtual field for available stock (sellable stock)
productSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stock - this.safetyStock);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model("Product", productSchema);
