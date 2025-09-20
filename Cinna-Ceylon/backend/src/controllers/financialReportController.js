// controllers/financialReportController.js
import FinancialReport from "../models/FinancialReport.js";
import Order from "../models/Order.js";
import Salary from "../models/Salary.js";
import SupPayment from "../models/SupPayment.js";
import DeliveryPayout from "../models/DeliveryPayout.js";

// ---------------- Helper: Calculate Financial Data ----------------
const calculateFinancialData = async () => {
  // Fetch all documents (no date filters)
  const [orders, salaries, supplierPayments, deliveryPayouts] = await Promise.all([
    Order.find({ status: { $ne: "cancelled" } }),
    Salary.find(),
    SupPayment.find(),
    DeliveryPayout.find()
  ]);

  // Use actual schema fields:
  // Order: total
  // Salary: Net_Salary
  // SupPayment: Net_Payment
  // DeliveryPayout: amount

  const totalIncome = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const salaryTotal = salaries.reduce((sum, s) => sum + (s.Net_Salary || 0), 0);
  const supplierTotal = supplierPayments.reduce((sum, sp) => sum + (sp.Net_Payment || 0), 0);
  const deliveryTotal = deliveryPayouts.reduce((sum, d) => sum + (d.amount || 0), 0);

  const totalExpenses = salaryTotal + supplierTotal + deliveryTotal;
  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    breakdown: {
      salaryTotal,
      supplierTotal,
      deliveryTotal
    }
  };
};

// ---------------- CRUD Controllers ----------------

// Create new report
export const createFinancialReport = async (req, res) => {
  try {
    const { Period, Total_Income, Total_Expenses, Supplier, Salary, Emergency } = req.body;
    const netBalance = (Total_Income || 0) - (Total_Expenses || 0);

    const report = new FinancialReport({
      Period,
      Total_Income,
      Total_Expenses,
      NetBalance: netBalance,
      Supplier: Supplier || false,
      Salary: Salary || false,
      Emergency: Emergency || false
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: "Error creating financial report", error: err.message });
  }
};

// Get all reports
export const getAllFinancialReports = async (req, res) => {
  try {
    const reports = await FinancialReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};

// Get one by ID
export const getFinancialReportById = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Error fetching report", error: err.message });
  }
};

// Update report
export const updateFinancialReport = async (req, res) => {
  try {
    const { Total_Income, Total_Expenses } = req.body;
    const netBalance = (Total_Income || 0) - (Total_Expenses || 0);

    const report = await FinancialReport.findByIdAndUpdate(
      req.params.id,
      { ...req.body, NetBalance: netBalance },
      { new: true, runValidators: true }
    );

    if (!report) return res.status(404).json({ message: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: "Error updating report", error: err.message });
  }
};

// Delete report
export const deleteFinancialReport = async (req, res) => {
  try {
    const report = await FinancialReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting report", error: err.message });
  }
};

// ---------------- API for Auto Calculation ----------------
export const getFinancialCalculations = async (req, res) => {
  try {
    const calculatedTotals = await calculateFinancialData();
    res.json({ calculatedTotals });
  } catch (err) {
    res.status(500).json({ message: "Error calculating data", error: err.message });
  }
};
