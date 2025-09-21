import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
  Emp_id: {
    type: String, // now just a simple string, optional
    required: false
  },
  Base_Salary: {
    type: Number,
    required: true
  },
  Bonus: {
    type: Number,
    default: 0
  },
  Overtime: {
    type: Number,
    default: 0
  },
  OT_Type: {
    type: String,
    enum: ["weekday", "weekend_holiday"],
    default: "weekday"
  },
  OT_Hours: {
    type: Number,
    default: 0
  },
  Tax: {
    type: Number,
    default: 0
  },
  EPF: {
    type: Number,
    default: 0
  },
  ETF: {
    type: Number,
    default: 0
  },
  Leave_Deduction: {
    type: Number,
    default: 0
  },
  Leave_Type: {
    type: String,
    enum: ["no_pay", "full_pay"],
    default: "full_pay"
  },
  No_Pay_Leave_Days: {
    type: Number,
    default: 0
  },
  Net_Salary: {
    type: Number,
    required: true
  },
  Month: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Salary", SalarySchema);
