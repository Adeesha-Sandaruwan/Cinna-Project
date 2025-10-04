import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true },// Ensure one delivery per order
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle", 
    required: true},
  status: {
    type: String,
    enum: ["assigned", "accepted", "in-transit", "delivered", "cancelled"],
    default: "assigned"},
  assignedAt: {
    type: Date,
    default: Date.now},
  estimatedDelivery: {
    type: Date},
  actualDelivery: {type: Date},
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Add index to ensure uniqueness is enforced properly
deliverySchema.index({ order: 1 }, { unique: true });

export default mongoose.model("Delivery", deliverySchema);
