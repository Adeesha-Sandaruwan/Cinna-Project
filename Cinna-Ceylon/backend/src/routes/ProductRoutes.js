import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";

const router = express.Router();

// CRUD with image upload
router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
