import express from "express";
import { createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier } from "../controllers/SupplierController.js";

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
