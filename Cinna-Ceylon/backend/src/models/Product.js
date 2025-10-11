import mongoose from "mongoose";
// Define Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Stock Keeping Unit (unique product code)
    sku: { type: String, unique: true, sparse: true },

    type: { type: String, required: true },

    grade: { type: String, enum: ["A", "B", "C"], default: "A" },

    description: { type: String },

    price: { type: Number, required: true, min: 0 },

    stock: { type: Number, default: 0, min: 0 },

    safetyStock: { type: Number, default: 5, min: 0 },

    reorderLevel: { type: Number, default: 10, min: 0 },

    safetyStock: { type: Number, default: 5, min: 0 },

    reorderLevel: { type: Number, default: 10, min: 0 },

    expiryDate: { type: Date, required: true },
    
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    // Product image URL/path
    image: { type: String },
    // Review summary fields for fast read on product pages
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { 
    // Adds createdAt and updatedAt automatically
    timestamps: true 
  }
);
// Virtual field for available stock (sellable stock)
productSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stock - this.safetyStock);
});

// Virtual field for available stock (sellable stock)
productSchema.virtual('availableStock').get(function() {
  return Math.max(0, this.stock - this.safetyStock);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Export Product model
export default mongoose.model("Product", productSchema);
