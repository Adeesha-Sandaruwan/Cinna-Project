import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventoryStatus,
} from "../controllers/ProductController.js";

const router = express.Router();

// CRUD with image upload
router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

// Inventory management routes
router.put("/:id/stock", updateStock);
router.get("/inventory/status", getInventoryStatus);

export default router;
