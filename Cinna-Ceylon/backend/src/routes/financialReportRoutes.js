import express from "express";
import { 
  createFinancialReport, 
  getAllFinancialReports, 
  getFinancialReportById, 
  updateFinancialReport, 
  deleteFinancialReport 
} from "../controllers/financialReportController.js";

const router = express.Router();

// Create a new financial report
router.post("/", createFinancialReport);

// Get all financial reports
router.get("/", getAllFinancialReports);

// Get a single financial report by ID
router.get("/:id", getFinancialReportById);

// Update financial report
router.put("/:id", updateFinancialReport);

// Delete financial report
router.delete("/:id", deleteFinancialReport);

export default router;
