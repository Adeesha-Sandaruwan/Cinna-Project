
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new user (admin only)
export const createUser = async (req, res) => {
  try {
  let { username, email, password, userType, role, profile } = req.body;
  // Diagnostic logging
  console.log('[createUser] incoming:', { username, email, userType, role });

    // Normalization: if client sent a specific manager role as userType (e.g. hr_manager)
    // convert to base userType 'manager' and move into role.
    if (userType && typeof userType === 'string' && userType.endsWith('_manager')) {
      role = userType; // capture specific manager role
      userType = 'manager';
    }
    if (role && typeof role === 'string') role = role.trim();
    
    // Validate required fields
    if (!username || !email || !password || !userType) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    // Validate and process userType and role
    let isAdmin = false;
    let effectiveRole = null;

    // Handle different user types and roles
    switch(userType) {
      case 'manager':
        if (!role || !role.includes('_manager')) {
          return res.status(400).json({ message: 'Manager must have a valid manager role' });
        }
        isAdmin = true;
        effectiveRole = role; // includes hr_manager now
        break;
        
      case 'admin':
        isAdmin = true;
        effectiveRole = 'admin';
        break;
        
      case 'buyer':
      case 'supplier':
      case 'driver':
        isAdmin = false;
        effectiveRole = null;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[createUser] normalized:', { userType, role, isAdmin: isAdmin });
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      userType, 
      role: effectiveRole,
      isAdmin, 
      profile 
    });
    
    await user.save();
    res.status(201).json({ 
      message: 'User created successfully', 
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

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
  let { username, email, password, userType, profile, role } = req.body;
  console.log('[updateUser] incoming:', { id, username, userType, role });

    // Normalize role-style userType values on update too
    if (userType && typeof userType === 'string' && userType.endsWith('_manager')) {
      role = userType;
      userType = 'manager';
    }
    if (role && typeof role === 'string') role = role.trim();
    
    let updateData = { 
      username, 
      email,
      profile 
    };

    // Handle role and permissions based on the requested user type
    if (userType) {
  updateData.userType = userType;
      
      if (userType === 'admin') {
        updateData.role = 'admin';
        updateData.isAdmin = true;
      } else if (userType === 'manager') {
        const effectiveRole = (role || req.body.role || '').trim();
        if (effectiveRole && effectiveRole.includes('_manager')) {
          updateData.role = effectiveRole; // hr_manager allowed
          updateData.isAdmin = true;
        } else {
          return res.status(400).json({ message: 'Manager requires a specific role' });
        }
      } else {
        // For regular users (buyer, supplier, driver)
        updateData.role = null;
        updateData.isAdmin = false;
      }
      console.log('[updateUser] normalized:', { userType: updateData.userType, role: updateData.role, isAdmin: updateData.isAdmin });
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      message: 'User updated successfully', 
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

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
