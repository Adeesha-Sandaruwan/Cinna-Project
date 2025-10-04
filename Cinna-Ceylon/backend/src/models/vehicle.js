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
    try {
      const Vehicle = mongoose.model('Vehicle');
      
      // Find the highest existing vehicleId number to avoid duplicates
      const lastVehicle = await Vehicle.findOne(
        { vehicleId: { $regex: /^VEH - \d+$/ } },
        { vehicleId: 1 }
      ).sort({ vehicleId: -1 }).lean();
      
      let nextNum = 1;
      
      if (lastVehicle && lastVehicle.vehicleId) {
        // Extract the number from the last vehicleId (e.g., "VEH - 05" -> 5)
        const match = lastVehicle.vehicleId.match(/VEH - (\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      
      // Generate new vehicleId with proper padding
      this.vehicleId = `VEH - ${nextNum.toString().padStart(2, '0')}`;
      
      // Double-check for uniqueness (extra safety)
      const existingVehicle = await Vehicle.findOne({ vehicleId: this.vehicleId });
      if (existingVehicle) {
        // If still exists, try next number
        nextNum++;
        this.vehicleId = `VEH - ${nextNum.toString().padStart(2, '0')}`;
      }
      
    } catch (error) {
      console.error('Error generating vehicleId:', error);
      // Fallback to timestamp-based ID if all else fails
      this.vehicleId = `VEH - ${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

export default mongoose.model("Vehicle", vehicleSchema);
