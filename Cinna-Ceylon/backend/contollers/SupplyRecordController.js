const SupplyRecord = require('../models/SupplyRecord');

// Create a new supply record
exports.createSupplyRecord = async (req, res) => {
    try {
        const record = new SupplyRecord(req.body);
        await record.save();
        res.status(201).json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all supply records
exports.getAllSupplyRecords = async (req, res) => {
    try {
        const records = await SupplyRecord.find().populate('Supplier');
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single supply record by ID
exports.getSupplyRecordById = async (req, res) => {
    try {
        const record = await SupplyRecord.findById(req.params.id).populate('Supplier');
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a supply record
exports.updateSupplyRecord = async (req, res) => {
    try {
        const record = await SupplyRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a supply record
exports.deleteSupplyRecord = async (req, res) => {
    try {
        const record = await SupplyRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
