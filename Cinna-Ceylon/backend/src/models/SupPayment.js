import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const supplierPaymentSchema = new Schema({
  Sup_id: { 
    type: Types.ObjectId, 
    ref: "Supplier", 
    required: false
  },
  Date: { type: Date, default: Date.now },
  Amount: { type: Number, required: true },
  Tax: { type: Number, required: true },
  Net_Payment: { type: Number, required: true }
}, { timestamps: true });

export default model("SupPayment", supplierPaymentSchema);