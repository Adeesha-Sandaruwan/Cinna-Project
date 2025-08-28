const Inventory = require('../models/Inventory');

// Create
exports.createInventory = async (req, res) => {
    try {
        const inventory = new Inventory(req.body);
        await inventory.save();
        res.status(201).json(inventory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Read all
exports.getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find();
        res.json(inventories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Read one
exports.getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) return res.status(404).json({ error: 'Not found' });
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!inventory) return res.status(404).json({ error: 'Not found' });
        res.json(inventory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete
exports.deleteInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!inventory) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
