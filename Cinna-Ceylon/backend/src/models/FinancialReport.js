import mongoose from "mongoose";

const financialReportSchema = new mongoose.Schema({
  FReport_ID: { type: mongoose.Schema.Types.ObjectId, auto: true },
  Period: { type: String, required: true },
  NetBalance: { type: Number, default: 0 },   // Auto-calculated
  Total_Income: { type: Number, default: 0 },
  Total_Expenses: { type: Number, default: 0 },
  ProfitLoss: { type: Boolean, default: false }, // true = profit, false = loss
  Supplier: { type: Boolean, default: false },
  Salary: { type: Boolean, default: false },
  Emergency: { type: Boolean, default: false },

  Salary_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Salary" },
  Pay_ID: { type: mongoose.Schema.Types.ObjectId, ref: "SupPayment" },
  DlPay_ID: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPayout" },
  Order_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
}, { timestamps: true });

/**
 * Pre-save hook to auto-calculate NetBalance and ProfitLoss
 */
financialReportSchema.pre("save", function (next) {
  // Auto-calc NetBalance
  this.NetBalance = this.Total_Income - this.Total_Expenses;

  // Set ProfitLoss flag (true if profit, false if loss or zero)
  this.ProfitLoss = this.NetBalance > 0;

  next();
});

/**
 * Pre-update hook (for findOneAndUpdate, findByIdAndUpdate, etc.)
 * Ensures NetBalance is recalculated when updating totals
 */
financialReportSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.Total_Income !== undefined || update.Total_Expenses !== undefined) {
    const income = update.Total_Income ?? this._update.$set?.Total_Income ?? 0;
    const expenses = update.Total_Expenses ?? this._update.$set?.Total_Expenses ?? 0;

    const netBalance = income - expenses;
    update.NetBalance = netBalance;
    update.ProfitLoss = netBalance > 0;
  }

  next();
});

const FinancialReport = mongoose.model("FinancialReport", financialReportSchema);

export default FinancialReport;
