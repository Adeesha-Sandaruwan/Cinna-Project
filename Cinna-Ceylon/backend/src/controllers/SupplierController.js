import Supplier from '../models/Supplier.js';

// Create supplier
export const createSupplier = async (req, res) => {
  try {
    const data = req.body;
    
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    const supplier = await Supplier.create(data);
    res.status(201).json(supplier);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort('-createdAt');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single supplier
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete supplier (soft delete)
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json({ message: "Supplier deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};