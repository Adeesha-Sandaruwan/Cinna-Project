import mongoose from "mongoose";
const { Schema, model } = mongoose;

const leaveRequestSchema = new Schema({
  employeeName: { type: String, required: true },
  reason: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

export default model("LeaveRequest", leaveRequestSchema);
