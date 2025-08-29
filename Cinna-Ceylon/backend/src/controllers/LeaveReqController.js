import LeaveRequest from "../models/LeaveReq.js";

// Create
export const createLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.create(req.body);
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
export const getLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ error: "Not found" });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leave) return res.status(404).json({ error: "Not found" });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
export const deleteLeaveRequest = async (req, res) => {
  try {
    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
