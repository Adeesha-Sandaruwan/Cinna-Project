import express from "express";
import upload from "../middleware/upload.js";
import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} from "../controllers/SupplierController.js";

const router = express.Router();

// CRUD operations with image upload
router.post("/", upload.single("profileImage"), createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.put("/:id", upload.single("profileImage"), updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
