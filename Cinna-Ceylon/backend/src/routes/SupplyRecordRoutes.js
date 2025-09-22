import express from "express";
import { 
  createSupplyRecord, 
  getSupplyRecords, 
  getSupplyRecord, 
  updateSupplyRecord, 
  deleteSupplyRecord,
  getSupplyRecordsBySupplier 
} from "../controllers/SupplyRecordController.js";

const router = express.Router();

router.post("/", createSupplyRecord);
router.get("/", getSupplyRecords);
router.get("/:id", getSupplyRecord);
router.put("/:id", updateSupplyRecord);
router.delete("/:id", deleteSupplyRecord);
router.get("/supplier/:supplierId", getSupplyRecordsBySupplier);

export default router;
