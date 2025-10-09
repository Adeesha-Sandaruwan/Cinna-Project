import express from "express";
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  assignDriverVehicle,
  updateBuyerDetails,
  driverAcceptDelivery,
  getDeliveriesByDriver,
  updateDeliveryStatus,
  notifyDeliveryStatusUpdate
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/", createDelivery);
router.get("/", getDeliveries);
router.get("/driver/:id", getDeliveriesByDriver); // Get deliveries for specific driver
router.get("/:id", getDeliveryById);
router.put("/:id", updateDelivery);
router.delete("/:id", deleteDelivery);

// Assign driver and vehicle to delivery
router.put("/:id/assign", assignDriverVehicle);

// Update buyer details for delivery
router.put("/:id/buyer", updateBuyerDetails);

// Driver accepts delivery
router.put("/:id/accept", driverAcceptDelivery);

// Additional routes for delivery status updates by driver
router.put("/:id/status", updateDeliveryStatus); // Enhanced status update with email notifications
router.post("/:id/notify", notifyDeliveryStatusUpdate); // Manual email notification trigger

export default router;
