// controllers/emergencyController.js
import Emergency from "../models/emergency.js";

// CREATE
export const createEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.create(req.body);
    res.status(201).json(emergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().populate("vehicle");
    // Only populate driver if it exists
    // No need to populate if no driver collection
    res.json(emergencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// READ one
export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate("vehicle")
      .populate({ path: "driver", model: "Driver" });
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });
    res.json(emergency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// UPDATE
export const updateEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });
    res.json(emergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });
    res.json({ message: "Emergency deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
