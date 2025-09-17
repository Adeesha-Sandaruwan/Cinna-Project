// controllers/accidentController.js
import Accident from "../models/accident.js";
import Vehicle from "../models/vehicle.js";

// CREATE
export const createAccident = async (req, res) => {
  try {
    const accident = await Accident.create(req.body);
    
    // Update the vehicle's accident cost and status if provided
    if (req.body.vehicle && req.body.accidentCost) {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, {
        accidentCost: req.body.accidentCost,
        status: req.body.severity === 'Critical' ? 'Inactive' : 'Maintenance'
      });
    }
    
    res.status(201).json(accident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getAccidents = async (req, res) => {
  try {
    const accidents = await Accident.find().populate("vehicle");
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getAccidentById = async (req, res) => {
  try {
    const accident = await Accident.findById(req.params.id).populate("vehicle");
    if (!accident) return res.status(404).json({ message: "Accident not found" });
    res.json(accident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateAccident = async (req, res) => {
  try {
    const accident = await Accident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!accident) return res.status(404).json({ message: "Accident not found" });
    
    // Update the vehicle's accident cost if provided
    if (req.body.accidentCost && accident.vehicle) {
      await Vehicle.findByIdAndUpdate(accident.vehicle, {
        accidentCost: req.body.accidentCost
      });
    }
    
    res.json(accident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteAccident = async (req, res) => {
  try {
    const accident = await Accident.findByIdAndDelete(req.params.id);
    if (!accident) return res.status(404).json({ message: "Accident not found" });
    res.json({ message: "Accident deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
