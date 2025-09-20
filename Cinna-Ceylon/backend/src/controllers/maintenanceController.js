// controllers/maintenanceController.js
import Maintenance from "../models/maintenance.js";
import Vehicle from "../models/vehicle.js";

// CREATE
export const createMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    
    // Update the vehicle's maintenance cost if provided
    if (req.body.vehicle && req.body.serviceCost) {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, {
        maintenanceCost: req.body.serviceCost,
        status: 'Maintenance'
      });
    }
    
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenance.find().populate("vehicle");
    res.json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate("vehicle");
    if (!maintenance) return res.status(404).json({ message: "Maintenance not found" });
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!maintenance) return res.status(404).json({ message: "Maintenance not found" });
    
    // Update the vehicle's maintenance cost if provided
    if (req.body.serviceCost && maintenance.vehicle) {
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, {
        maintenanceCost: req.body.serviceCost
      });
    }
    
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    if (!maintenance) return res.status(404).json({ message: "Maintenance not found" });
    res.json({ message: "Maintenance deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
