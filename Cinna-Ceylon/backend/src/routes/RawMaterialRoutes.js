import express from "express";
import upload from "../middleware/upload.js";
import {
  createRawMaterial,
  getRawMaterials,
  getRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getRawMaterialsBySupplier
} from "../controllers/RawMaterialController.js";

const router = express.Router();

// CRUD operations with image upload
router.post("/", upload.single("materialPhoto"), createRawMaterial);
router.get("/", getRawMaterials);
router.get("/:id", getRawMaterial);
router.put("/:id", upload.single("materialPhoto"), updateRawMaterial);
router.delete("/:id", deleteRawMaterial);

// Get raw materials by supplier
router.get("/supplier/:supplierId", getRawMaterialsBySupplier);

export default router;