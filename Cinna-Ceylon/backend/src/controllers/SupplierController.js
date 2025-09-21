import Supplier from '../models/Supplier.js';
import mongoose from 'mongoose';

// Create supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, contactNumber, email, address, whatsappNumber } = req.body;
    
    // Input validation
    if (!name || !contactNumber || !email || !address) {
      return res.status(400).json({ 
        error: "Missing required fields: name, contactNumber, email, and address are required" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(contactNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: "Invalid contact number format" });
    }

    const data = { name, contactNumber, email, address, whatsappNumber };
    
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
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supplier ID format" });
    }

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
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supplier ID format" });
    }

    const { name, contactNumber, email, address, whatsappNumber } = req.body;
    
    // Input validation for provided fields
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    if (contactNumber) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(contactNumber.replace(/\s/g, ''))) {
        return res.status(400).json({ error: "Invalid contact number format" });
      }
    }

    const data = { name, contactNumber, email, address, whatsappNumber };
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// Delete supplier (soft delete)
export const deleteSupplier = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supplier ID format" });
    }

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