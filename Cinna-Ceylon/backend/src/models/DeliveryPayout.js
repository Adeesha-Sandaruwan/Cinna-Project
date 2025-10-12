import mongoose from "mongoose";
const deliveryPayoutSchema = new mongoose.Schema({
  referenceType: {
    type: String, enum: ["Maintenance", "Emergency"], required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'referenceType'
  },
  payoutDate: {
    type: Date, default: Date.now, required: true,
  },
  amount: {
    type: Number, required: true, min: 0,
  },
  paymentStatus: {
    type: String, enum: ["Pending", "Processing", "Completed", "Failed"], default: "Pending",
  },
  notes: {
    type: String, trim: true,
  },
  approvedBy: {
    type: String, trim: true,
  },
}, { timestamps: true });

// Index for better query performance
deliveryPayoutSchema.index({ referenceType: 1, referenceId: 1 });
deliveryPayoutSchema.index({ payoutDate: 1 });

export default mongoose.model("DeliveryPayout", deliveryPayoutSchema);
