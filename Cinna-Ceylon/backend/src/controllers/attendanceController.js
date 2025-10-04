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
  console.log('🔍 SendOTP called for email:', email);
  
  try {
    // Validate email input
    if (!email) {
      console.log('❌ No email provided');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    console.log('🔍 User details:', user ? { id: user._id, role: user.role, isAdmin: user.isAdmin } : 'N/A');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is admin or has admin role
    const adminRoles = ['delivery manager', 'product manager', 'finance manager', 'user manager'];
    console.log('🔒 User role check - Role:', user.role, 'isAdmin:', user.isAdmin);
    
    if (!user.isAdmin && !adminRoles.includes(user.role)) {
      console.log('❌ User not authorized for attendance');
      return res.status(403).json({ message: 'Not authorized - Admin access required' });
    }

    // Check if attendance is already marked in the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttendance = await Attendance.findOne({ user: user._id, date: { $gte: since } });
    console.log('📅 Recent attendance check:', recentAttendance ? 'Found' : 'None');
    
    if (recentAttendance) {
      console.log('⏰ Attendance already marked recently');
      return res.status(400).json({ message: 'Attendance already marked in the last 24 hours.' });
    }

    const otp = generateOTP();
    console.log('🔑 Generated OTP:', otp);
    
    // Fix user role if it's invalid for saving
    let originalRole = user.role;
    let originalUserType = user.userType;
    
    // Temporarily fix invalid enum values for saving
    if (user.role === 'admin' || !['delivery manager', 'product manager', 'finance manager', 'user manager'].includes(user.role)) {
      user.role = 'user manager'; // Default for admin users
    }
    if (user.userType === 'admin' || !['buyer', 'supplier', 'driver'].includes(user.userType)) {
      user.userType = 'supplier'; // Temporary fix for saving
    }
    
    user.otp = otp;
    await user.save();
    console.log('💾 User saved with OTP');
    
    // Restore original values after save (for consistency)
    user.role = originalRole;
    user.userType = originalUserType;

    // Check email configuration
    console.log('📧 Email config check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'Missing ❌');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✓' : 'Missing ❌');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email configuration missing');
      return res.status(500).json({ 
        message: 'Email service not configured',
        error: 'Missing EMAIL_USER or EMAIL_PASS environment variables',
        otp: otp // For debugging - remove in production
      });
    }

    // Send email (configure transporter as needed)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        // Add additional configuration for better reliability
        tls: {
          rejectUnauthorized: false
        }
      });
      
      console.log('📮 Attempting to send email to:', email);
      
      // Verify transporter configuration
      await transporter.verify();
      console.log('✅ Email transporter verified');
      
      const mailOptions = {
        from: `"CinnaCeylon System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Attendance OTP - CinnaCeylon',
        text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #8B4513; margin: 0;">🌿 CinnaCeylon</h2>
              <p style="color: #666; margin: 5px 0;">Attendance Verification</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="color: #333; margin-top: 0;">Your Attendance OTP</h3>
              <div style="font-size: 32px; font-weight: bold; color: #8B4513; background: white; padding: 15px; border-radius: 8px; margin: 20px 0; letter-spacing: 3px;">
                ${otp}
              </div>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                If you didn't request this OTP, please ignore this email.
              </p>
            </div>
          </div>
        `
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      
      res.json({ 
        message: 'OTP sent successfully',
        messageId: result.messageId
      });
      
    } catch (emailError) {
      console.error('📧 Email sending failed:', emailError);
      console.error('Email error details:', {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
      
      // Still save the OTP so admin can use it for testing
      res.status(500).json({ 
        message: 'Failed to send email, but OTP generated', 
        error: emailError.message,
        errorCode: emailError.code,
        otp: otp // Include OTP for debugging (remove in production)
      });
    }
    
  } catch (err) {
    console.error('❌ SendOTP error:', err);
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
  console.log('🔍 MarkAttendance called for email:', email);
  
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    console.log('👤 User found for attendance:', user ? 'Yes' : 'No');
    
    if (!user || user.otp !== otp) {
      console.log('❌ Invalid OTP or user not found');
      return res.status(400).json({ message: 'Invalid OTP or user not found' });
    }
    
    // Determine role for attendance - use user's role or default to 'user manager' for admins
    let attendanceRole = user.role;
    if (!attendanceRole && user.isAdmin) {
      attendanceRole = 'user manager'; // Default role for admin users without specific role
    }
    
    console.log('🔒 Attendance role determined:', attendanceRole);
    
    // Validate that the role is one of the allowed values
    const allowedRoles = ['delivery manager', 'product manager', 'finance manager', 'user manager'];
    if (!allowedRoles.includes(attendanceRole)) {
      console.log('❌ Invalid role for attendance:', attendanceRole);
      return res.status(400).json({ message: 'Invalid user role for attendance' });
    }
    
    const attendance = new Attendance({
      user: user._id,
      role: attendanceRole,
      otp,
      status: 'present',
      date: new Date()
    });
    
    await attendance.save();
    console.log('✅ Attendance saved');
    
    // Clear the OTP
    user.otp = undefined;
    await user.save();
    console.log('🔑 OTP cleared from user');
    
    res.json({ 
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        role: attendanceRole,
        date: attendance.date
      }
    });
    
  } catch (err) {
    console.error('❌ MarkAttendance error:', err);
    res.status(500).json({ 
      message: 'Error marking attendance', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};