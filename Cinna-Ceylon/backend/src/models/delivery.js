import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  houseNo: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\+?\d{7,15}$/, "Please enter a valid phone number"],
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle", 
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "accepted", "rejected", "in-transit", "delivered", "cancelled"],
    default: "pending",
  },
  assignedAt: {
    type: Date,
    default: null,
  },
  actualDelivery: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);
