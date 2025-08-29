import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const supplierRecordSchema = new Schema({
  supplier: { type: Types.ObjectId, ref: "Supplier", required: true },
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
  quality: { type: String }
}, { timestamps: true });

export default model("SupplierRecord", supplierRecordSchema);
