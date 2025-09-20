
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Helper to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to email
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is admin or has admin role
    const adminRoles = ['delivery manager', 'product manager', 'finance manager', 'user manager'];
    if (!user.isAdmin && !adminRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if attendance is already marked in the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttendance = await Attendance.findOne({ user: user._id, date: { $gte: since } });
    if (recentAttendance) {
      return res.status(400).json({ message: 'Attendance already marked in the last 24 hours.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    // Send email (configure transporter as needed)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Attendance OTP',
      text: `Your OTP code is: ${otp}`
    });
    res.json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};

// Mark attendance
export const markAttendance = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Determine role for attendance - use user's role or default to 'user manager' for admins
    let attendanceRole = user.role;
    if (!attendanceRole && user.isAdmin) {
      attendanceRole = 'user manager'; // Default role for admin users without specific role
    }
    
    // Validate that the role is one of the allowed values
    const allowedRoles = ['delivery manager', 'product manager', 'finance manager', 'user manager'];
    if (!allowedRoles.includes(attendanceRole)) {
      return res.status(400).json({ message: 'Invalid user role for attendance' });
    }
    
    const attendance = new Attendance({
      user: user._id,
      role: attendanceRole,
      otp,
      status: 'present'
    });
    await attendance.save();
    user.otp = undefined;
    await user.save();
    res.json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking attendance', error: err.message });
  }
};
