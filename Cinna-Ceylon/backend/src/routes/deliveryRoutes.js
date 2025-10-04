import express from "express";
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  assignDriverVehicle,
  updateBuyerDetails,
  driverAcceptDelivery
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/", createDelivery);
router.get("/", getDeliveries);
router.get("/:id", getDeliveryById);
router.put("/:id", updateDelivery);
router.delete("/:id", deleteDelivery);

// Assign driver and vehicle to delivery
router.put("/:id/assign", assignDriverVehicle);

// Update buyer details for delivery
router.put("/:id/buyer", updateBuyerDetails);

// Driver accepts delivery
router.put("/:id/accept", driverAcceptDelivery);

export default router;
