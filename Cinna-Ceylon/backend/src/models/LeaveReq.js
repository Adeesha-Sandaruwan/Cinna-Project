import mongoose from "mongoose";
const { Schema, model } = mongoose;

const leaveRequestSchema = new Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String },
  reason: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  leaveType: { type: String },
  duration: { type: Number },
  category: { 
    type: String, 
    enum: ['delivery_manager','admin','product_manager','financial_manager','other'], 
    default: 'other' 
  },
  certificationName: { type: String },
  certificationMime: { type: String },
  certificationSize: { type: Number },
  certificationUrl: { type: String },
  certificationPath: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

export default model("LeaveRequest", leaveRequestSchema);
