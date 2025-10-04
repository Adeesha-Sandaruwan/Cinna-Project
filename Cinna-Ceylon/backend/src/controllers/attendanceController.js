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
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save();

    // For development/testing, we'll skip actual email sending
    // In production, configure proper email service
    console.log('Generated OTP for testing:', otp);
    console.log('Email would be sent to:', email);
    
    // Simulate email sending success for development
    res.json({ 
      message: 'OTP sent',
      devNote: 'In development mode - check console for OTP',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
    // Uncomment below for production email sending
    /*
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Attendance OTP - Cinna Ceylon',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B4513;">Attendance Verification</h2>
            <p>Hello ${user.username},</p>
            <p>Your OTP code for attendance verification is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #8B4513; border-radius: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Cinna Ceylon Team</p>
          </div>
        `
      });
      res.json({ message: 'OTP sent' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // In development, still allow OTP to proceed even if email fails
      res.json({ 
        message: 'OTP generated (email service temporarily unavailable)',
        devNote: 'Check console for OTP - email service needs configuration',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
    */
  } catch (err) {
    console.error('Full error in sendOtp:', err);
    res.status(500).json({ 
      message: 'Error sending OTP', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Mark attendance
export const markAttendance = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Check if OTP has expired
    if (user.otpExpires && user.otpExpires < new Date()) {
      // Clean up expired OTP
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
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
    
    // Clean up OTP after successful use
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    res.json({ message: 'Attendance marked successfully', role: attendanceRole });
  } catch (err) {
    console.error('Attendance marking error:', err);
    res.status(500).json({ message: 'Error marking attendance', error: err.message });
  }
};