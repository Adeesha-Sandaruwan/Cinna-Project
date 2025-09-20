// routes/supPaymentRoutes.js
import express from "express";
import {
  createSupplierPayment,
  getAllSupplierPayments,
  getSupplierPaymentById,
  updateSupplierPayment,
  deleteSupplierPayment,
  generateSupplierPaymentPDF
} from "../controllers/supPaymentController.js";

const router = express.Router();

// =============================
// CRUD ROUTES
// =============================
router.post("/", createSupplierPayment);
router.get("/", getAllSupplierPayments);
router.get("/:id", getSupplierPaymentById);
router.put("/:id", updateSupplierPayment);
router.delete("/:id", deleteSupplierPayment);

// =============================
// PDF Download Route - CORRECTED ENDPOINT
// =============================
router.get("/:id/pdf", generateSupplierPaymentPDF);

export default router;