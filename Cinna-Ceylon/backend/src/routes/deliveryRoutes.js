import express from "express";
import auth from "../middleware/auth.js";
import { 
  createDelivery,
  getDeliveries,
  getAvailableOrders,
  getDeliveriesByDriver,
  getDeliveryById,
  updateDelivery,
  sendDeliveryNotification,
  deleteDelivery
} from "../controllers/deliveryController.js";

const router = express.Router();

// Create delivery assignment (assign driver and vehicle to order)
router.post("/", createDelivery);

// Get all deliveries
router.get("/", getDeliveries);

// Get available orders for assignment
router.get("/available-orders", getAvailableOrders);

// Get deliveries by driver (protected - only authenticated drivers can access)
router.get("/driver/:driverId", auth, getDeliveriesByDriver);

// Get delivery by ID (protected)
router.get("/:id", auth, getDeliveryById);

// Update delivery status/details (protected - drivers can update their deliveries)
router.put("/:id", auth, updateDelivery);

// Send email notification to buyer
router.post("/:id/notify", sendDeliveryNotification);

// Delete delivery assignment
router.delete("/:id", deleteDelivery);

export default router;
