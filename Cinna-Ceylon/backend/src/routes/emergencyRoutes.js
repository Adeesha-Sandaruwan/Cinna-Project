import express from "express";
import {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  updateEmergency,
  deleteEmergency
} from "../controllers/emergencyController.js";

const router = express.Router();

router.post("/", createEmergency);
router.get("/", getEmergencies);
router.get("/:id", getEmergencyById);
router.put("/:id", updateEmergency);
router.delete("/:id", deleteEmergency);

export default router;
