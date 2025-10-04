import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createTestAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('❌ Test admin already exists');
      process.exit(0);
    }

    // Create test admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const testAdmin = new User({
      username: 'testadmin',
      email: 'admin@test.com', // Change this to your actual email for testing
      password: hashedPassword,
      userType: 'buyer', // Required field
      role: 'user manager', // Admin role for attendance
      isAdmin: true,
      profile: {
        name: 'Test Admin',
        address: 'Test Address',
        phone: '0771234567'
      }
    });

    await testAdmin.save();
    console.log('✅ Test admin created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: user manager');
    console.log('🔒 isAdmin: true');
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestAdmin();