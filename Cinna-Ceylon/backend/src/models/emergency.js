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
    required: false,
    validate: {
      validator: function(v) {
        // Only validate if a value exists
        if (!v) return true;
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid driver ObjectId`
    }
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
