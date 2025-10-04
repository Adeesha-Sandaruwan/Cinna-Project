import SupplierRecord from "../models/SupplyRecord.js";

// Create
export const createSupplierRecord = async (req, res) => {
  try {
    const record = await SupplierRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
export const getSupplierRecords = async (req, res) => {
  try {
    const records = await SupplierRecord.find().populate("supplier");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
export const getSupplierRecord = async (req, res) => {
  try {
    const record = await SupplierRecord.findById(req.params.id).populate("supplier");
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateSupplierRecord = async (req, res) => {
  try {
    const record = await SupplierRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
export const deleteSupplierRecord = async (req, res) => {
  try {
    await SupplierRecord.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
