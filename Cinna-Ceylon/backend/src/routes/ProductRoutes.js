import express from "express";
import upload from "../middleware/upload.js"; // Middleware to handle file/image uploads
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

// ---------------------- PRODUCT ROUTES ---------------------- //

// Create a new product (with image upload)
// - Expects form-data with fields + image file under "image"
router.post("/", upload.single("image"), createProduct);

// Get a list of all products
router.get("/", getProducts);

// Get details of a single product by ID
router.get("/:id", getProduct);

// Update an existing product (with image upload if provided)
router.put("/:id", upload.single("image"), updateProduct);

// Delete a product by ID
router.delete("/:id", deleteProduct);

// ----------------- INVENTORY MANAGEMENT ROUTES ----------------- //

// Update stock for a specific product (e.g., add/remove quantities)
router.put("/:id/stock", updateStock);

// Get overall inventory status (could include stock levels, reorder needs, etc.)
router.get("/inventory/status", getInventoryStatus);

export default router;
