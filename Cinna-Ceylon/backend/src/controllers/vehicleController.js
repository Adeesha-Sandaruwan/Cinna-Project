// controllers/vehicleController.js
import Vehicle from "../models/vehicle.js";
import Maintenance from "../models/maintenance.js";
import Accident from "../models/accident.js";
import path from "path";

// CREATE
export const createVehicle = async (req, res) => {
  try {
    const data = req.body;
    if (req.files) {
      if (req.files.insuranceFile) data.insuranceFile = path.basename(req.files.insuranceFile[0].path);
      if (req.files.serviceFile) data.serviceFile = path.basename(req.files.serviceFile[0].path);
    }
    if (req.files && req.files.maintenanceReport) data.maintenanceReport = path.basename(req.files.maintenanceReport[0].path);
    if (req.files && req.files.accidentReport) data.accidentReport = path.basename(req.files.accidentReport[0].path);
    const vehicle = await Vehicle.create(data);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ one
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateVehicle = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Files received:", req.files);
    
    const updateData = { ...req.body };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.maintenanceReport) {
        updateData.maintenanceReport = path.basename(req.files.maintenanceReport[0].path);
        console.log("Maintenance report file saved:", updateData.maintenanceReport);
      }
      if (req.files.accidentReport) {
        updateData.accidentReport = path.basename(req.files.accidentReport[0].path);
        console.log("Accident report file saved:", updateData.accidentReport);
      }
      if (req.files.insuranceFile) updateData.insuranceFile = path.basename(req.files.insuranceFile[0].path);
      if (req.files.serviceFile) updateData.serviceFile = path.basename(req.files.serviceFile[0].path);
    }
    
    // Parse and validate cost fields
    if (req.body.maintenanceCost !== undefined) {
      const cost = Number(req.body.maintenanceCost);
      if (!isNaN(cost) && cost >= 0) {
        updateData.maintenanceCost = cost;
        console.log("Maintenance cost set to:", cost);
      }
    }
    
    if (req.body.accidentCost !== undefined) {
      const cost = Number(req.body.accidentCost);
      if (!isNaN(cost) && cost >= 0) {
        updateData.accidentCost = cost;
        console.log("Accident cost set to:", cost);
      }
    }
    
    console.log("Final update data:", updateData);
    
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    
    // Create detailed maintenance record if maintenance data is provided
    if (req.files && req.files.maintenanceReport && req.body.maintenanceCost) {
      try {
        await Maintenance.create({
          vehicle: req.params.id,
          serviceCost: Number(req.body.maintenanceCost),
          maintenanceReport: path.basename(req.files.maintenanceReport[0].path),
          description: "Maintenance report submitted via vehicle details page"
        });
        console.log("Maintenance record created successfully");
      } catch (maintenanceError) {
        console.error("Error creating maintenance record:", maintenanceError);
      }
    }
    
    // Create detailed accident record if accident data is provided
    if (req.files && req.files.accidentReport && req.body.accidentCost) {
      try {
        await Accident.create({
          vehicle: req.params.id,
          accidentCost: Number(req.body.accidentCost),
          accidentReport: req.files.accidentReport[0].path,
          description: "Accident report submitted via vehicle details page",
          accidentDate: new Date(),
          severity: "Minor" // Default, can be updated later
        });
        console.log("Accident record created successfully");
      } catch (accidentError) {
        console.error("Error creating accident record:", accidentError);
      }
    }
    
    console.log("Vehicle updated successfully:", vehicle);
    res.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUBMIT MAINTENANCE REPORT
export const submitMaintenanceReport = async (req, res) => {
  try {
    console.log("Maintenance submission - Body:", req.body);
    console.log("Maintenance submission - Files:", req.files);
    console.log("Maintenance submission - File (single):", req.file);

    const { maintenanceCost } = req.body;
    const vehicleId = req.params.id;

    if (!maintenanceCost) {
      return res.status(400).json({ message: "Maintenance cost is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Maintenance report file is required" });
    }

    // Update vehicle with maintenance cost and report
    const vehicleUpdateData = {
      maintenanceCost: Number(maintenanceCost),
      maintenanceReport: path.basename(req.file.path),
      status: "Maintenance"
    };

    const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, vehicleUpdateData, { new: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Create detailed maintenance record
    const maintenanceRecord = await Maintenance.create({
      vehicle: vehicleId,
      serviceCost: Number(maintenanceCost),
  maintenanceReport: path.basename(req.file.path),
      description: "Maintenance report submitted via vehicle details page"
    });

    console.log("Maintenance record created:", maintenanceRecord);
    res.json({ 
      message: "Maintenance report submitted successfully", 
      vehicle, 
      maintenance: maintenanceRecord 
    });
  } catch (error) {
    console.error("Error submitting maintenance report:", error);
    res.status(400).json({ message: error.message });
  }
};

// SUBMIT ACCIDENT REPORT
export const submitAccidentReport = async (req, res) => {
  try {
    console.log("Accident submission - Body:", req.body);
    console.log("Accident submission - Files:", req.files);
    console.log("Accident submission - File (single):", req.file);

    const { accidentCost, severity = "Minor", location, driverName } = req.body;
    const vehicleId = req.params.id;

    if (!accidentCost) {
      return res.status(400).json({ message: "Accident cost is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Accident report file is required" });
    }

    // Update vehicle with accident cost and report
    const vehicleUpdateData = {
      accidentCost: Number(accidentCost),
      accidentReport: req.file.path,
      status: severity === "Critical" ? "Inactive" : "Maintenance"
    };

    const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, vehicleUpdateData, { new: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Create detailed accident record
    const accidentRecord = await Accident.create({
      vehicle: vehicleId,
      accidentCost: Number(accidentCost),
      accidentReport: req.file.path,
      description: "Accident report submitted via vehicle details page",
      severity: severity,
      location: location || "",
      driverName: driverName || ""
    });

    console.log("Accident record created:", accidentRecord);
    res.json({ 
      message: "Accident report submitted successfully", 
      vehicle, 
      accident: accidentRecord 
    });
  } catch (error) {
    console.error("Error submitting accident report:", error);
    res.status(400).json({ message: error.message });
  }
};

// GET VEHICLE MAINTENANCE HISTORY
export const getVehicleMaintenanceHistory = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const maintenanceRecords = await Maintenance.find({ vehicle: vehicleId })
      .populate('vehicle', 'vehicleId vehicleType')
      .sort({ createdAt: -1 });
    
    res.json(maintenanceRecords);
  } catch (error) {
    console.error("Error fetching maintenance history:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET VEHICLE ACCIDENT HISTORY
export const getVehicleAccidentHistory = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const accidentRecords = await Accident.find({ vehicle: vehicleId })
      .populate('vehicle', 'vehicleId vehicleType')
      .sort({ createdAt: -1 });
    
    res.json(accidentRecords);
  } catch (error) {
    console.error("Error fetching accident history:", error);
    res.status(500).json({ message: error.message });
  }
};
