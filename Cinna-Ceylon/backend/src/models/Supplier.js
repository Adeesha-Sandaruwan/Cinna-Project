import mongoose from "mongoose";
const { Schema, model } = mongoose;

const supplierSchema = new Schema({
  name: { type: String, required: true },
  contact: String,
  email: String,
  address: String
}, { timestamps: true });

export default model("Supplier", supplierSchema);
