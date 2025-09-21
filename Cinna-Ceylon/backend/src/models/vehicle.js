import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    unique: true,
    index: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["Truck", "truck", "Van", "van", "Bike", "bike", "Car", "car"],
  },
  capacity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "In Use", "Maintenance", "Inactive"],
    default: "Available",
  },
  insuranceNo: {
    type: String,
    required: true,
    unique: true,
  },
  insuranceExpDate: {
    type: Date,
    required: true,
  },
  insuranceFile: {
    type: String,
  },
  serviceDate: {
    type: Date,
  },
  serviceFile: {
    type: String,
  },
  maintenanceReport: {
    type: String,
  },
  maintenanceCost: {
    type: Number,
    default: null,
  },
  accidentReport: {
    type: String,
  },
  accidentCost: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

// Auto-generate vehicleId before saving (incremental)
vehicleSchema.pre('save', async function(next) {
  if (!this.vehicleId) {
    const Vehicle = mongoose.model('Vehicle');
    const count = await Vehicle.countDocuments();
    const nextNum = count + 1;
    this.vehicleId = `VEH - ${nextNum.toString().padStart(2, '0')}`;
  }
  next();
});

export default mongoose.model("Vehicle", vehicleSchema);
