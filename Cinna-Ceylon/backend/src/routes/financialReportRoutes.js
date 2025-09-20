import express from "express";
import {
  createFinancialReport,
  getAllFinancialReports,
  getFinancialReportById,
  updateFinancialReport,
  deleteFinancialReport,
  getFinancialCalculations
} from "../controllers/financialReportController.js";

const router = express.Router();

router.post("/", createFinancialReport);
router.get("/", getAllFinancialReports);
router.get("/:id", getFinancialReportById);
router.put("/:id", updateFinancialReport);
router.delete("/:id", deleteFinancialReport);

// Auto-calculation route (no dates now)
router.get("/data/calculations", getFinancialCalculations);

export default router;