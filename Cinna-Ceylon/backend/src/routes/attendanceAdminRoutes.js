import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
const router = express.Router();

// Get all attendance records (optionally filter by user, date, etc.)
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'username email profile');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
});

// Generate attendance report (basic CSV)
router.get('/report', async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'username email profile');
    let csv = 'Username,Email,Name,Date,Role,Status\n';
    records.forEach(r => {
      csv += `${r.user?.username || ''},${r.user?.email || ''},${r.user?.profile?.name || ''},${r.date.toISOString()},${r.role},${r.status}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error generating report', error: err.message });
  }
});

export default router;
