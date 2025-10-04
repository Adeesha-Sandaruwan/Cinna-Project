
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const register = async (req, res) => {
  try {
    const { username, email, password, userType, profile } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    // isAdmin is not settable by normal registration
    const user = new User({ username, email, password: hashedPassword, userType, profile, isAdmin: false });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username: user.username, email: user.email, userType: user.userType, profile: user.profile } });
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
    const token = jwt.sign({ id: user._id, userType: user.userType, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, userType: user.userType, role: user.role, isAdmin: user.isAdmin, profile: user.profile } });
  } catch (err) {
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
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all drivers (users with userType 'driver')
export const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ userType: 'driver' }).select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
