import SupplyRecord from '../models/SupplyRecord.js';
import RawMaterial from '../models/RawMaterial.js';
import mongoose from 'mongoose';

// Create supply record
export const createSupplyRecord = async (req, res) => {
  try {
    const { supplier, rawMaterial, buyer, quantitySold, pricePerKg, notes } = req.body;

    // Input validation
    if (!supplier || !rawMaterial || !buyer || !quantitySold || !pricePerKg) {
      return res.status(400).json({ 
        error: "Missing required fields: supplier, rawMaterial, buyer, quantitySold, and pricePerKg are required" 
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(supplier)) {
      return res.status(400).json({ error: "Invalid supplier ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(rawMaterial)) {
      return res.status(400).json({ error: "Invalid raw material ID format" });
    }

    if (quantitySold <= 0) {
      return res.status(400).json({ error: "Quantity sold must be greater than 0" });
    }

    if (pricePerKg <= 0) {
      return res.status(400).json({ error: "Price per kg must be greater than 0" });
    }

    const data = { supplier, rawMaterial, buyer, quantitySold, pricePerKg, notes };

    // Check if raw material exists and is available
    const rawMaterialDoc = await RawMaterial.findById(rawMaterial);
    if (!rawMaterialDoc) {
      return res.status(404).json({ error: "Raw material not found" });
    }

    if (rawMaterialDoc.status !== 'available') {
      return res.status(400).json({ error: "Raw material is not available for sale" });
    }

    if (quantitySold > rawMaterialDoc.quantity) {
      return res.status(400).json({ error: "Quantity sold cannot exceed available quantity" });
    }

    const supplyRecord = await SupplyRecord.create(data);
    
    // Update raw material quantity or status
    const newQuantity = rawMaterialDoc.quantity - quantitySold;
    if (newQuantity <= 0) {
      await RawMaterial.findByIdAndUpdate(rawMaterial, { 
        quantity: 0, 
        status: 'sold' 
      });
    } else {
      await RawMaterial.findByIdAndUpdate(rawMaterial, { 
        quantity: newQuantity 
      });
    }

    const populatedRecord = await SupplyRecord.findById(supplyRecord._id)
      .populate('supplier', 'name email contactNumber')
      .populate('rawMaterial', 'quality materialPhoto');
    
    res.status(201).json(populatedRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all supply records
export const getSupplyRecords = async (req, res) => {
  try {
    const { supplier, paymentStatus, deliveryStatus } = req.query;
    let filter = {};

    if (supplier) filter.supplier = supplier;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    const supplyRecords = await SupplyRecord.find(filter)
      .populate('supplier', 'name email contactNumber')
      .populate('rawMaterial', 'quality materialPhoto location')
      .sort('-createdAt');
    
    res.json(supplyRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single supply record
export const getSupplyRecord = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supply record ID format" });
    }

    const supplyRecord = await SupplyRecord.findById(req.params.id)
      .populate('supplier', 'name email contactNumber whatsappNumber address')
      .populate('rawMaterial');
    
    if (!supplyRecord) return res.status(404).json({ error: "Supply record not found" });
    res.json(supplyRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update supply record
export const updateSupplyRecord = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supply record ID format" });
    }

    const data = req.body;

    const supplyRecord = await SupplyRecord.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('supplier', 'name email contactNumber')
      .populate('rawMaterial', 'quality materialPhoto');
    
    if (!supplyRecord) return res.status(404).json({ error: "Supply record not found" });
    res.json(supplyRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete supply record
export const deleteSupplyRecord = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid supply record ID format" });
    }

    const supplyRecord = await SupplyRecord.findById(req.params.id);
    if (!supplyRecord) return res.status(404).json({ error: "Supply record not found" });

    // Restore quantity to raw material if record is deleted
    await RawMaterial.findByIdAndUpdate(supplyRecord.rawMaterial, {
      $inc: { quantity: supplyRecord.quantitySold },
      status: 'available'
    });

    await SupplyRecord.findByIdAndDelete(req.params.id);
    res.json({ message: "Supply record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get supply records by supplier
export const getSupplyRecordsBySupplier = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.supplierId)) {
      return res.status(400).json({ error: "Invalid supplier ID format" });
    }

    const supplyRecords = await SupplyRecord.find({ supplier: req.params.supplierId })
      .populate('supplier', 'name email contactNumber')
      .populate('rawMaterial', 'quality materialPhoto location')
      .sort('-createdAt');
    
    res.json(supplyRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};