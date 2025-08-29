import express from "express";
import { createSupplierRecord, getSupplierRecords, getSupplierRecord, updateSupplierRecord, deleteSupplierRecord } from "../controllers/SupplyRecordController.js";

const router = express.Router();

router.post("/", createSupplierRecord);
router.get("/", getSupplierRecords);
router.get("/:id", getSupplierRecord);
router.put("/:id", updateSupplierRecord);
router.delete("/:id", deleteSupplierRecord);

export default router;
