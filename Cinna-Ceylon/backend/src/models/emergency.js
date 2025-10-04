import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver", 
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
}, { timestamps: true });

export default mongoose.model("Emergency", emergencySchema);
