import mongoose from "mongoose";

const accidentSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  accidentDate: {
    type: Date,
    required: true,
  },
  accidentCost: {
    type: Number,
    required: true,
    min: 0,
  },
  severity: {
    type: String,
    enum: ["Minor", "Major", "Critical"],
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  driverName: {
    type: String,
    trim: true,
  },
  insuranceClaim: {
    type: Boolean,
    default: false,
  },
  repairStatus: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  accidentReport: {
    type: String, // File path for accident report document
  },
}, { timestamps: true });

export default mongoose.model("Accident", accidentSchema);
