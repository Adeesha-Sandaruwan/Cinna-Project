import express from "express";
import * as deliveryPayoutController from "../controllers/deliveryPayoutController.js";

const router = express.Router();

// Payout routes
router.post("/", deliveryPayoutController.createDeliveryPayout);
router.get("/", deliveryPayoutController.getDeliveryPayouts);
router.get("/:id", deliveryPayoutController.getDeliveryPayoutById);
router.put("/:id", deliveryPayoutController.updateDeliveryPayout);
router.delete("/:id", deliveryPayoutController.deleteDeliveryPayout);

// Utility routes
router.get("/references/available", deliveryPayoutController.getAvailableReferences);
router.get("/stats/summary", deliveryPayoutController.getPayoutStatistics);

export default router;