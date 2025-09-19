import FinancialReport from "../models/FinancialReport.js";

// Create a new Financial Report
export const createFinancialReport = async (req, res) => {
  try {
    const report = new FinancialReport(req.body);
    await report.save();
    res.status(201).json({ message: "Financial report created successfully", report });
  } catch (error) {
    res.status(400).json({ message: "Error creating financial report", error: error.message });
  }
};

// Get all Financial Reports (with populated relations)
export const getAllFinancialReports = async (req, res) => {
  try {
    const reports = await FinancialReport.find()
      .populate("Salary_ID", "Base_Salary Net_Salary Month")
      .populate("Pay_ID", "Date Amount")
      .populate("DlPay_ID", "Date Amount Reason")
      .populate("Order_ID", "OrderNumber TotalAmount Status");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching financial reports", error: error.message });
  }
};

// Get Financial Report by ID
export const getFinancialReportById = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id)
      .populate("Salary_ID", "Base_Salary Net_Salary Month")
      .populate("Pay_ID", "Date Amount")
      .populate("DlPay_ID", "Date Amount Reason")
      .populate("Order_ID", "OrderNumber TotalAmount Status");

    if (!report) return res.status(404).json({ message: "Financial report not found" });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching financial report", error: error.message });
  }
};

// Update Financial Report
export const updateFinancialReport = async (req, res) => {
  try {
    const report = await FinancialReport.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!report) return res.status(404).json({ message: "Financial report not found" });

    res.status(200).json({ message: "Financial report updated successfully", report });
  } catch (error) {
    res.status(400).json({ message: "Error updating financial report", error: error.message });
  }
};

// Delete Financial Report
export const deleteFinancialReport = async (req, res) => {
  try {
    const report = await FinancialReport.findByIdAndDelete(req.params.id);

    if (!report) return res.status(404).json({ message: "Financial report not found" });

    res.status(200).json({ message: "Financial report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting financial report", error: error.message });
  }
};
