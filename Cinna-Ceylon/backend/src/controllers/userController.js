
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
console.log('🔐 User controller JWT_SECRET:', JWT_SECRET);

export const register = async (req, res) => {
  try {
    const { username, email, password, userType, profile } = req.body;

    // Basic validation
    if (!username || !email || !password) return res.status(400).json({ message: 'username, email and password are required' });
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ message: 'Invalid email format' });
    const usernameRe = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRe.test(username)) return res.status(400).json({ message: 'Invalid username. Use 3-30 chars: letters, numbers, _ or -' });
    if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include letters and numbers' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User with that email or username already exists' });
    // Validate phone if provided
    const phone = profile?.phone;
    if (phone) {
      const digits = String(phone).replace(/\D/g, '');
      if (digits.length !== 10) return res.status(400).json({ message: 'Phone number must contain exactly 10 digits' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // isAdmin is not settable by normal registration
    // Set isAdmin and role based on userType
    const isAdmin = userType === 'admin' || userType.includes('manager');
    const role = userType.includes('manager') ? userType : (userType === 'admin' ? 'admin' : undefined);

    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      userType, 
      role,
      profile, 
      isAdmin 
    });
    
    await user.save();
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        userType: user.userType,
        role: user.role,
        isAdmin: user.isAdmin, 
        profile: user.profile 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Create token payload
    const tokenPayload = { id: user._id, userType: user.userType, isAdmin: user.isAdmin };
    console.log('🔑 Creating JWT token with payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });
    
    const responseData = {
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        userType: user.userType, 
        role: user.role, 
        isAdmin: user.isAdmin, 
        profile: user.profile 
      }
    };
    
    console.log('✅ Login successful for user:', { email, userType: user.userType, isAdmin: user.isAdmin });
    res.json(responseData);
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Return updated user data (excluding password)
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      profile: user.profile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update own profile (not userType or isAdmin)
export const updateProfile = async (req, res) => {
  try {
    console.log('Update profile payload:', req.body);
    const { username, email, password, profile } = req.body;
    const updateData = { username, email, profile };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    // Prevent userType and isAdmin changes
    delete req.body.userType;
    delete req.body.isAdmin;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-password');
    console.log('User after update:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      profile: user.profile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete own profile
// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ userType: 'supplier' }).select('-password');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id).select('-password');
    if (!supplier || supplier.userType !== 'supplier') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!users) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
