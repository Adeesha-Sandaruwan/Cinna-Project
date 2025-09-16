import mongoose from "mongoose";

// Define Product Schema
const productSchema = new mongoose.Schema(
  {
    // Product name (required, auto-trimmed to remove extra spaces)
    name: { type: String, required: true, trim: true },

    // Stock Keeping Unit (unique product code)
    // unique + sparse: uniqueness only applies when a value is set (null allowed)
    sku: { type: String, unique: true, sparse: true },

    // Product category/type (e.g., electronics, medicine)
    type: { type: String, required: true },

    // Product grade/quality (only A, B, or C allowed, default A)
    grade: { type: String, enum: ["A", "B", "C"], default: "A" },

    // Optional description
    description: { type: String },

    // Selling price (must be >= 0)
    price: { type: Number, required: true, min: 0 },

    // Current stock quantity
    stock: { type: Number, default: 0, min: 0 },

    // Minimum buffer stock (not to be sold, reserved for emergencies)
    safetyStock: { type: Number, default: 5, min: 0 },

    // Stock level at which reordering is triggered
    reorderLevel: { type: Number, default: 10, min: 0 },

    // Expiry date (required, useful for perishable products)
    expiryDate: { type: Date, required: true },

    // Visibility of product (public: visible to all, private: hidden from customers)
    visibility: { type: String, enum: ["public", "private"], default: "public" },

    // Product image URL/path
    image: { type: String },
  },
  { 
    // Adds createdAt and updatedAt automatically
    timestamps: true 
  }
);

// Virtual field (not stored in DB) → calculates sellable stock
productSchema.virtual('availableStock').get(function() {
  // Available stock = stock - safetyStock (but never less than 0)
  return Math.max(0, this.stock - this.safetyStock);
});

// Ensure virtuals (like availableStock) appear in JSON and objects
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Export Product model
export default mongoose.model("Product", productSchema);