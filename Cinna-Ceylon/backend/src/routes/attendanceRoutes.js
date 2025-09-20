
import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

router.post('/send-otp', attendanceController.sendOtp);
router.post('/mark-attendance', attendanceController.markAttendance);

export default router;
