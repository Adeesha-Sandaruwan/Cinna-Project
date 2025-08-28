const LeaveReq = require('../models/LeaveReq');

// Create
exports.createLeaveReq = async (req, res) => {
    try {
        const leave = new LeaveReq(req.body);
        await leave.save();
        res.status(201).json(leave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Read all
exports.getAllLeaveReqs = async (req, res) => {
    try {
        const leaves = await LeaveReq.find().populate('Emp_Id');
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Read one
exports.getLeaveReqById = async (req, res) => {
    try {
        const leave = await LeaveReq.findById(req.params.id).populate('Emp_Id');
        if (!leave) return res.status(404).json({ error: 'Not found' });
        res.json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateLeaveReq = async (req, res) => {
    try {
        const leave = await LeaveReq.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leave) return res.status(404).json({ error: 'Not found' });
        res.json(leave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete
exports.deleteLeaveReq = async (req, res) => {
    try {
        const leave = await LeaveReq.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
