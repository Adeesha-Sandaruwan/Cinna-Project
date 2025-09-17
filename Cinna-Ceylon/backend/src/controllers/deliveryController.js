// controllers/deliveryController.js
import Delivery from "../models/delivery.js";
import { sendDeliveryStatusEmail } from "../utils/emailSender.js";

// CREATE
export const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate("vehicle");
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("vehicle");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json({ message: "Delivery deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign driver and vehicle
export const assignDriverVehicle = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, vehicle: vehicleId, status: "assigned" },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update buyer details
export const updateBuyerDetails = async (req, res) => {
  try {
    const updateFields = (({ firstName, lastName, email, houseNo, postalCode, phoneNumber, vehicle }) => ({ firstName, lastName, email, houseNo, postalCode, phoneNumber, vehicle }))(req.body);
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json({ message: "Buyer details updated!", delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Driver accepts delivery
export const driverAcceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    // Send email to buyer
    try {
      await sendDeliveryStatusEmail(
        delivery.email,
        `${delivery.firstName} ${delivery.lastName}`,
        delivery.status
      );
    } catch (emailErr) {
      // Log but don't block response
      console.error("Email send error:", emailErr);
    }
    res.json({ message: "Delivery accepted!", delivery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
