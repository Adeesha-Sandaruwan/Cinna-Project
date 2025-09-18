import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  description: {
    type: String,
    default: "Maintenance report submitted",
    trim: true,
  },
  serviceDate: {
    type: Date,
    default: Date.now,
  },
  serviceCost: {
    type: Number,
    required: true,
    min: 0,
  },
  nextServiceDue: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    }
  },
  maintenanceReport: {
    type: String, // File path for maintenance report document
  },
  status: {
    type: String,
    enum: ["Scheduled", "In Progress", "Completed"],
    default: "Completed",
  },
  mechanicName: {
    type: String,
    trim: true,
  },
  partsReplaced: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Virtual for download URL (assuming static serving from /uploads)
maintenanceSchema.virtual('maintenanceReportUrl').get(function() {
  if (this.maintenanceReport) {
    return `/uploads/${this.maintenanceReport}`;
  }
  return null;
});


maintenanceSchema.set('toJSON', { virtuals: true });
maintenanceSchema.set('toObject', { virtuals: true });

export default mongoose.model("Maintenance", maintenanceSchema);
