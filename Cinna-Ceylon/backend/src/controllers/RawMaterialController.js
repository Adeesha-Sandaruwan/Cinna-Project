import RawMaterial from '../models/RawMaterial.js';

// Create raw material
export const createRawMaterial = async (req, res) => {
  try {
    const data = req.body;
    
    if (req.file) {
      data.materialPhoto = req.file.filename;
    }

    // Validate harvest date if provided
    if (data.harvestDate) {
      const harvestDate = new Date(data.harvestDate);
      const today = new Date();
      if (harvestDate > today) {
        return res.status(400).json({ error: "Harvest date cannot be in the future" });
      }
    }

    const rawMaterial = await RawMaterial.create(data);
    const populatedMaterial = await RawMaterial.findById(rawMaterial._id).populate('supplier', 'name email contactNumber');
    
    res.status(201).json(populatedMaterial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all raw materials
export const getRawMaterials = async (req, res) => {
  try {
    const { supplier, quality, status, visibility } = req.query;
    let filter = {};

    if (supplier) filter.supplier = supplier;
    if (quality) filter.quality = quality;
    if (status) filter.status = status;
    if (visibility) filter.visibility = visibility;

    const rawMaterials = await RawMaterial.find(filter)
      .populate('supplier', 'name email contactNumber whatsappNumber')
      .sort('-createdAt');
    
    res.json(rawMaterials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single raw material
export const getRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id)
      .populate('supplier', 'name email contactNumber whatsappNumber address');
    
    if (!rawMaterial) return res.status(404).json({ error: "Raw material not found" });
    res.json(rawMaterial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update raw material
export const updateRawMaterial = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.materialPhoto = req.file.filename;
    }

    if (data.harvestDate) {
      const harvestDate = new Date(data.harvestDate);
      const today = new Date();
      if (harvestDate > today) {
        return res.status(400).json({ error: "Harvest date cannot be in the future" });
      }
    }

    const rawMaterial = await RawMaterial.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('supplier', 'name email contactNumber');
    
    if (!rawMaterial) return res.status(404).json({ error: "Raw material not found" });
    res.json(rawMaterial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete raw material
export const deleteRawMaterial = async (req, res) => {
  try {
    await RawMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: "Raw material deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get raw materials by supplier
export const getRawMaterialsBySupplier = async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.find({ supplier: req.params.supplierId })
      .populate('supplier', 'name email contactNumber')
      .sort('-createdAt');
    
    res.json(rawMaterials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};